using B1ngo.Domain.Core;
using B1ngo.Domain.Game;
using B1ngo.Domain.Game.Events;
using B1ngo.Domain.Game.Tests.Helpers;

namespace B1ngo.Domain.Game.Tests;

public class RoomTests
{
    private static readonly RaceSession DefaultSession = new(2026, "Bahrain Grand Prix", SessionType.Race);
    private static readonly DateTimeOffset Now = DateTimeOffset.UtcNow; // kept for MarkSquare calls

    private readonly RoomBuilder _builder = new();

    #region Create

    [Fact]
    public void Create_WithValidInputs_SetsStatusToLobby()
    {
        var sut = _builder.Build();

        Assert.Equal(RoomStatus.Lobby, sut.Status);
    }

    [Fact]
    public void Create_WithValidInputs_GeneratesJoinCode()
    {
        var sut = _builder.Build();

        Assert.False(string.IsNullOrWhiteSpace(sut.JoinCode));
        Assert.Equal(6, sut.JoinCode.Length);
    }

    [Fact]
    public void Create_WithValidInputs_AddsHostAsFirstPlayer()
    {
        var sut = _builder.WithHostDisplayName("Alice").Build();

        Assert.Single(sut.Players);
        Assert.Equal("Alice", sut.Players[0].DisplayName);
    }

    [Fact]
    public void Create_WithValidInputs_SetsHostPlayerId()
    {
        var sut = _builder.Build();

        Assert.Equal(sut.Players[0].Id, sut.HostPlayerId);
    }

    [Fact]
    public void Create_WithDefaultConfiguration_UsesDefaults()
    {
        var sut = _builder.Build();

        Assert.Equal(5, sut.Configuration.MatrixSize);
        Assert.Contains(WinPatternType.Row, sut.Configuration.WinningPatterns);
        Assert.Contains(WinPatternType.Column, sut.Configuration.WinningPatterns);
        Assert.Contains(WinPatternType.Diagonal, sut.Configuration.WinningPatterns);
    }

    [Fact]
    public void Create_WithCustomConfiguration_UsesProvidedValues()
    {
        var config = new RoomConfiguration(7, [WinPatternType.Blackout]);
        var sut = _builder.WithConfiguration(config).Build();

        Assert.Equal(7, sut.Configuration.MatrixSize);
        Assert.Single(sut.Configuration.WinningPatterns);
        Assert.Equal(WinPatternType.Blackout, sut.Configuration.WinningPatterns[0]);
    }

    [Fact]
    public void Create_WithValidInputs_SetsF1Session()
    {
        var session = new RaceSession(2026, "Monaco Grand Prix", SessionType.Qualifying);
        var sut = _builder.WithSession(session).Build();

        Assert.Equal(2026, sut.Session.Season);
        Assert.Equal("Monaco Grand Prix", sut.Session.GrandPrixName);
        Assert.Equal(SessionType.Qualifying, sut.Session.SessionType);
    }

    [Fact]
    public void Create_WithValidInputs_RaisesRoomCreatedAndPlayerJoinedEvents()
    {
        var sut = _builder.Build();

        Assert.Equal(2, sut.DomainEvents.Count);
        Assert.IsType<RoomCreatedDomainEvent>(sut.DomainEvents[0]);
        Assert.IsType<PlayerJoinedRoomDomainEvent>(sut.DomainEvents[1]);
    }

    [Fact]
    public void Create_WithValidInputs_InitializesEmptyLeaderboard()
    {
        var sut = _builder.Build();

        Assert.Empty(sut.Leaderboard);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithInvalidHostDisplayName_ThrowsArgumentException(string? name)
    {
        Assert.ThrowsAny<ArgumentException>(() => Room.Create(name!, DefaultSession));
    }

    [Fact]
    public void Create_WithNullSession_ThrowsArgumentNullException()
    {
        Assert.Throws<ArgumentNullException>(() => Room.Create("Host", null!));
    }

    #endregion

    #region AddPlayer

    [Fact]
    public void AddPlayer_InLobby_AddsPlayerToList()
    {
        var sut = _builder.Build();

        var player = sut.AddPlayer("Alice");

        Assert.Equal(2, sut.Players.Count);
        Assert.Equal("Alice", player.DisplayName);
    }

    [Fact]
    public void AddPlayer_InLobby_ReturnsCreatedPlayer()
    {
        var sut = _builder.Build();

        var player = sut.AddPlayer("Alice");

        Assert.NotNull(player);
        Assert.NotEqual(Guid.Empty, player.Id.Value);
    }

    [Fact]
    public void AddPlayer_InLobby_RaisesPlayerJoinedDomainEvent()
    {
        var sut = _builder.Build();
        sut.ClearDomainEvents();

        sut.AddPlayer("Alice");

        var domainEvent = Assert.Single(sut.DomainEvents);
        var playerJoined = Assert.IsType<PlayerJoinedRoomDomainEvent>(domainEvent);
        Assert.Equal("Alice", playerJoined.DisplayName);
    }

    [Fact]
    public void AddPlayer_WhenActive_ThrowsDomainConflictException()
    {
        var sut = CreateActiveRoom();

        Assert.Throws<DomainConflictException>(() => sut.AddPlayer("NewPlayer"));
    }

    [Fact]
    public void AddPlayer_WhenCompleted_ThrowsDomainConflictException()
    {
        var sut = CreateCompletedRoom();

        Assert.Throws<DomainConflictException>(() => sut.AddPlayer("NewPlayer"));
    }

    [Fact]
    public void AddPlayer_WhenRoomIsFull_ThrowsDomainConflictException()
    {
        var config = new RoomConfiguration(5, [WinPatternType.Row], maxPlayers: 2);
        var sut = _builder.WithConfiguration(config).Build();

        // Host is player 1, add player 2 to reach max
        sut.AddPlayer("Player2");

        var ex = Assert.Throws<DomainConflictException>(() => sut.AddPlayer("Player3"));
        Assert.Equal("room_full", ex.Code);
    }

    [Fact]
    public void AddPlayer_WithDuplicateDisplayName_ThrowsDomainConflictException()
    {
        var sut = _builder.WithHostDisplayName("Alice").Build();

        var ex = Assert.Throws<DomainConflictException>(() => sut.AddPlayer("Alice"));
        Assert.Equal("display_name_taken", ex.Code);
    }

    [Fact]
    public void AddPlayer_WithDuplicateDisplayNameDifferentCase_ThrowsDomainConflictException()
    {
        var sut = _builder.WithHostDisplayName("Alice").Build();

        var ex = Assert.Throws<DomainConflictException>(() => sut.AddPlayer("alice"));
        Assert.Equal("display_name_taken", ex.Code);
    }

    #endregion

    #region StartGame

    [Fact]
    public void StartGame_FromLobby_SetsStatusToActive()
    {
        var sut = CreateLobbyRoomWithCards();

        sut.StartGame();

        Assert.Equal(RoomStatus.Active, sut.Status);
    }

    [Fact]
    public void StartGame_FromLobby_RaisesGameStartedDomainEvent()
    {
        var sut = CreateLobbyRoomWithCards();
        sut.ClearDomainEvents();

        sut.StartGame();

        var domainEvent = Assert.Single(sut.DomainEvents);
        Assert.IsType<GameStartedDomainEvent>(domainEvent);
    }

    [Fact]
    public void StartGame_WhenPlayersLackCards_ThrowsDomainConflictException()
    {
        var sut = _builder.Build();

        var ex = Assert.Throws<DomainConflictException>(() => sut.StartGame());
        Assert.Equal("players_missing_cards", ex.Code);
    }

    [Fact]
    public void StartGame_WhenAlreadyActive_ThrowsDomainConflictException()
    {
        var sut = CreateActiveRoom();

        var ex = Assert.Throws<DomainConflictException>(() => sut.StartGame());
        Assert.Equal("room_not_in_lobby", ex.Code);
    }

    [Fact]
    public void StartGame_WhenCompleted_ThrowsDomainConflictException()
    {
        var sut = CreateCompletedRoom();

        var ex = Assert.Throws<DomainConflictException>(() => sut.StartGame());
        Assert.Equal("room_not_in_lobby", ex.Code);
    }

    #endregion

    #region EndGame

    [Fact]
    public void EndGame_FromActive_SetsStatusToCompleted()
    {
        var sut = CreateActiveRoom();

        sut.EndGame();

        Assert.Equal(RoomStatus.Completed, sut.Status);
    }

    [Fact]
    public void EndGame_FromActive_RaisesGameCompletedDomainEvent()
    {
        var sut = CreateActiveRoom();
        sut.ClearDomainEvents();

        sut.EndGame();

        var domainEvent = Assert.Single(sut.DomainEvents);
        Assert.IsType<GameCompletedDomainEvent>(domainEvent);
    }

    [Fact]
    public void EndGame_WhenLobby_ThrowsDomainConflictException()
    {
        var sut = _builder.Build();

        var ex = Assert.Throws<DomainConflictException>(() => sut.EndGame());
        Assert.Equal("room_not_active", ex.Code);
    }

    [Fact]
    public void EndGame_WhenAlreadyCompleted_ThrowsDomainConflictException()
    {
        var sut = CreateCompletedRoom();

        var ex = Assert.Throws<DomainConflictException>(() => sut.EndGame());
        Assert.Equal("room_not_active", ex.Code);
    }

    #endregion

    #region MarkSquare

    [Fact]
    public void MarkSquare_WithValidInputs_MarksSquareOnPlayerCard()
    {
        var sut = CreateActiveRoom();
        var playerId = sut.Players[0].Id;

        sut.MarkSquare(playerId, 0, 0, SquareMarkedBy.Player, Now);

        var square = sut.Players[0].Card!.GetSquare(0, 0);
        Assert.True(square.IsMarked);
        Assert.Equal(SquareMarkedBy.Player, square.MarkedBy);
    }

    [Fact]
    public void MarkSquare_WithValidInputs_RaisesSquareMarkedDomainEvent()
    {
        var sut = CreateActiveRoom();
        var playerId = sut.Players[0].Id;
        sut.ClearDomainEvents();

        sut.MarkSquare(playerId, 0, 0, SquareMarkedBy.Player, Now);

        var domainEvent = Assert.Single(sut.DomainEvents);
        var squareMarked = Assert.IsType<SquareMarkedDomainEvent>(domainEvent);
        Assert.Equal(playerId, squareMarked.PlayerId);
        Assert.Equal(0, squareMarked.Row);
        Assert.Equal(0, squareMarked.Column);
    }

    [Fact]
    public void MarkSquare_WhenPlayerHasWon_ThrowsDomainConflictException()
    {
        var sut = CreateActiveRoom();
        var playerId = sut.Players[0].Id;

        MarkEntireRow(sut, playerId, 0);

        Assert.True(sut.Players[0].HasWon);
        var ex = Assert.Throws<DomainConflictException>(() =>
            sut.MarkSquare(playerId, 1, 0, SquareMarkedBy.Player, Now)
        );
        Assert.Equal("player_already_won", ex.Code);
    }

    [Fact]
    public void MarkSquare_WhenNotActive_ThrowsDomainConflictException()
    {
        var sut = CreateLobbyRoomWithCards();
        var playerId = sut.Players[0].Id;

        Assert.Throws<DomainConflictException>(() => sut.MarkSquare(playerId, 0, 0, SquareMarkedBy.Player, Now));
    }

    [Fact]
    public void MarkSquare_ForNonExistentPlayer_ThrowsDomainNotFoundException()
    {
        var sut = CreateActiveRoom();
        var fakePlayerId = PlayerId.New();

        Assert.Throws<DomainNotFoundException>(() => sut.MarkSquare(fakePlayerId, 0, 0, SquareMarkedBy.Player, Now));
    }

    [Fact]
    public void MarkSquare_WhenCompletesRow_AddsToLeaderboard()
    {
        var sut = CreateActiveRoom();
        var playerId = sut.Players[0].Id;

        MarkEntireRow(sut, playerId, 0);

        Assert.Single(sut.Leaderboard);
        Assert.Equal(playerId, sut.Leaderboard[0].PlayerId);
        Assert.Equal(1, sut.Leaderboard[0].Rank);
        Assert.Equal(WinPatternType.Row, sut.Leaderboard[0].WinningPattern);
    }

    [Fact]
    public void MarkSquare_WhenCompletesRow_SetsPlayerHasWon()
    {
        var sut = CreateActiveRoom();
        var playerId = sut.Players[0].Id;

        MarkEntireRow(sut, playerId, 0);

        Assert.True(sut.Players[0].HasWon);
    }

    [Fact]
    public void MarkSquare_WhenCompletesPattern_RaisesBingoAchievedDomainEvent()
    {
        var sut = CreateActiveRoom();
        var playerId = sut.Players[0].Id;
        sut.ClearDomainEvents();

        MarkEntireRow(sut, playerId, 0);

        var bingoEvent = sut.DomainEvents.OfType<BingoAchievedDomainEvent>().SingleOrDefault();
        Assert.NotNull(bingoEvent);
        Assert.Equal(playerId, bingoEvent.PlayerId);
        Assert.Equal(WinPatternType.Row, bingoEvent.Pattern);
        Assert.Equal(1, bingoEvent.Rank);
    }

    #endregion

    #region UnmarkSquare

    [Fact]
    public void UnmarkSquare_WithValidInputs_UnmarksSquare()
    {
        var sut = CreateActiveRoom();
        var playerId = sut.Players[0].Id;
        sut.MarkSquare(playerId, 0, 0, SquareMarkedBy.Player, Now);

        sut.UnmarkSquare(playerId, 0, 0);

        var square = sut.Players[0].Card!.GetSquare(0, 0);
        Assert.False(square.IsMarked);
    }

    [Fact]
    public void UnmarkSquare_WithValidInputs_RaisesSquareUnmarkedDomainEvent()
    {
        var sut = CreateActiveRoom();
        var playerId = sut.Players[0].Id;
        sut.MarkSquare(playerId, 0, 0, SquareMarkedBy.Player, Now);
        sut.ClearDomainEvents();

        sut.UnmarkSquare(playerId, 0, 0);

        var domainEvent = Assert.Single(sut.DomainEvents);
        Assert.IsType<SquareUnmarkedDomainEvent>(domainEvent);
    }

    [Fact]
    public void UnmarkSquare_WhenNotActive_ThrowsDomainConflictException()
    {
        var sut = CreateLobbyRoomWithCards();
        var playerId = sut.Players[0].Id;

        Assert.Throws<DomainConflictException>(() => sut.UnmarkSquare(playerId, 0, 0));
    }

    [Fact]
    public void UnmarkSquare_WhenRevokesWinningPattern_RemovesFromLeaderboard()
    {
        var sut = CreateActiveRoom();
        var playerId = sut.Players[0].Id;

        MarkEntireRow(sut, playerId, 0);

        Assert.True(sut.Players[0].HasWon);
        Assert.Single(sut.Leaderboard);

        sut.UnmarkSquare(playerId, 0, 0);
        var winRevoked = sut.ReevaluateWin(playerId);

        Assert.True(winRevoked);
        Assert.False(sut.Players[0].HasWon);
        Assert.Empty(sut.Leaderboard);
    }

    [Fact]
    public void UnmarkSquare_WhenRevokesWin_ReranksRemainingLeaderboard()
    {
        var sut = CreateActiveRoomWithTwoPlayers();
        var player1Id = sut.Players[0].Id;
        var player2Id = sut.Players[1].Id;

        // Player 1 wins first
        MarkEntireRow(sut, player1Id, 0);

        // Player 2 wins second
        MarkEntireRow(sut, player2Id, 0);

        Assert.Equal(2, sut.Leaderboard.Count);

        // Revoke player 1's win
        sut.UnmarkSquare(player1Id, 0, 0);
        sut.ReevaluateWin(player1Id);

        Assert.Single(sut.Leaderboard);
        Assert.Equal(player2Id, sut.Leaderboard[0].PlayerId);
        Assert.Equal(1, sut.Leaderboard[0].Rank);
    }

    #endregion

    #region EditSquare

    [Fact]
    public void EditSquare_InLobby_UpdatesDisplayText()
    {
        var sut = CreateLobbyRoomWithCards();
        var playerId = sut.Players[0].Id;

        sut.EditSquare(playerId, 0, 0, "Custom event");

        var square = sut.Players[0].Card!.GetSquare(0, 0);
        Assert.Equal("Custom event", square.DisplayText);
    }

    [Fact]
    public void EditSquare_InLobby_ClearsEventKey()
    {
        var sut = CreateLobbyRoomWithCards();
        var playerId = sut.Players[0].Id;

        sut.EditSquare(playerId, 0, 0, "Custom event");

        var square = sut.Players[0].Card!.GetSquare(0, 0);
        Assert.Null(square.EventKey);
    }

    [Fact]
    public void EditSquare_WhenActive_ThrowsDomainConflictException()
    {
        var sut = CreateActiveRoom();
        var playerId = sut.Players[0].Id;

        var ex = Assert.Throws<DomainConflictException>(() => sut.EditSquare(playerId, 0, 0, "Custom"));
        Assert.Equal("room_not_in_lobby", ex.Code);
    }

    [Fact]
    public void EditSquare_OnFreeSpace_ThrowsDomainConflictException()
    {
        var sut = CreateLobbyRoomWithCards();
        var playerId = sut.Players[0].Id;

        var ex = Assert.Throws<DomainConflictException>(() => sut.EditSquare(playerId, 2, 2, "Custom"));
        Assert.Equal("square_is_free_space", ex.Code);
    }

    #endregion

    #region GetHost

    [Fact]
    public void GetHost_ReturnsHostPlayer()
    {
        var sut = _builder.WithHostDisplayName("HostPlayer").Build();

        var host = sut.GetHost();

        Assert.Equal("HostPlayer", host.DisplayName);
        Assert.Equal(sut.HostPlayerId, host.Id);
    }

    #endregion

    #region HasPlayerWithDisplayName

    [Fact]
    public void HasPlayerWithDisplayName_WhenExists_ReturnsTrue()
    {
        var sut = _builder.WithHostDisplayName("Alice").Build();

        Assert.True(sut.HasPlayerWithDisplayName("Alice"));
        Assert.True(sut.HasPlayerWithDisplayName("alice"));
    }

    [Fact]
    public void HasPlayerWithDisplayName_WhenNotExists_ReturnsFalse()
    {
        var sut = _builder.Build();

        Assert.False(sut.HasPlayerWithDisplayName("NonExistent"));
    }

    #endregion

    #region Helpers

    private static void MarkEntireRow(Room room, PlayerId playerId, int row)
    {
        for (var col = 0; col < 5; col++)
        {
            var square = room.Players.First(p => p.Id == playerId).Card!.GetSquare(row, col);
            if (!square.IsFreeSpace && !square.IsMarked)
            {
                room.MarkSquare(playerId, row, col, SquareMarkedBy.Player, Now);
                room.EvaluateWin(playerId, Now);
            }
        }
    }

    private Room CreateLobbyRoomWithCards()
    {
        var room = _builder.Build();
        foreach (var player in room.Players)
        {
            player.AssignCard(new BingoCardBuilder().Build());
        }

        return room;
    }

    private Room CreateActiveRoom()
    {
        var room = CreateLobbyRoomWithCards();
        room.StartGame();
        return room;
    }

    private Room CreateActiveRoomWithTwoPlayers()
    {
        var room = _builder.Build();
        room.AddPlayer("Player2");

        foreach (var player in room.Players)
        {
            player.AssignCard(new BingoCardBuilder().Build());
        }

        room.StartGame();
        return room;
    }

    private Room CreateCompletedRoom()
    {
        var room = CreateActiveRoom();
        room.EndGame();
        return room;
    }

    #endregion
}
