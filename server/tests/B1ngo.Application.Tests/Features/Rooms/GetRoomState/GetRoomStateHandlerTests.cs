using B1ngo.Application.Features.Rooms.GetRoomState;
using B1ngo.Application.Tests.Fakes;
using B1ngo.Domain.Game;

namespace B1ngo.Application.Tests.Features.Rooms.GetRoomState;

public class GetRoomStateHandlerTests
{
    private static readonly RaceSession DefaultSession = new(2026, "Bahrain Grand Prix", SessionType.Race);

    private readonly FakeRoomRepository _roomRepository = new();
    private readonly FakeBingoCardGenerator _cardGenerator = new();
    private readonly GetRoomStateHandler _sut;

    public GetRoomStateHandlerTests()
    {
        _sut = new GetRoomStateHandler(_roomRepository);
    }

    private Room SeedRoomWithCards()
    {
        var room = Room.Create("Host", DefaultSession);
        var host = room.Players[0];
        host.AssignCard(_cardGenerator.Generate(SessionType.Race, 5));
        _roomRepository.Seed(room);
        return room;
    }

    [Fact]
    public async Task HandleAsync_WithValidPlayer_ReturnsSuccess()
    {
        var room = SeedRoomWithCards();
        var playerId = room.Players[0].Id.Value;
        var query = new GetRoomStateQuery(room.Id.Value, playerId);

        var result = await _sut.HandleAsync(query);

        Assert.True(result.IsSuccess);
    }

    [Fact]
    public async Task HandleAsync_WithValidPlayer_MapsRoomFields()
    {
        var room = SeedRoomWithCards();
        var playerId = room.Players[0].Id.Value;
        var query = new GetRoomStateQuery(room.Id.Value, playerId);

        var result = await _sut.HandleAsync(query);

        var response = result.Value;
        Assert.Equal(room.Id.Value, response.RoomId);
        Assert.Equal(room.JoinCode, response.JoinCode);
        Assert.Equal("Lobby", response.Status);
        Assert.Equal(room.HostPlayerId.Value, response.HostPlayerId);
    }

    [Fact]
    public async Task HandleAsync_WithValidPlayer_MapsSession()
    {
        var room = SeedRoomWithCards();
        var playerId = room.Players[0].Id.Value;
        var query = new GetRoomStateQuery(room.Id.Value, playerId);

        var result = await _sut.HandleAsync(query);

        var session = result.Value.Session;
        Assert.Equal(2026, session.Season);
        Assert.Equal("Bahrain Grand Prix", session.GrandPrixName);
        Assert.Equal("Race", session.SessionType);
    }

    [Fact]
    public async Task HandleAsync_WithValidPlayer_MapsConfiguration()
    {
        var room = SeedRoomWithCards();
        var playerId = room.Players[0].Id.Value;
        var query = new GetRoomStateQuery(room.Id.Value, playerId);

        var result = await _sut.HandleAsync(query);

        var config = result.Value.Configuration;
        Assert.Equal(5, config.MatrixSize);
        Assert.Equal(new[] { "Row", "Column", "Diagonal" }, config.WinningPatterns);
    }

    [Fact]
    public async Task HandleAsync_WithValidPlayer_MapsPlayers()
    {
        var room = SeedRoomWithCards();
        var host = room.Players[0];
        var query = new GetRoomStateQuery(room.Id.Value, host.Id.Value);

        var result = await _sut.HandleAsync(query);

        Assert.Single(result.Value.Players);
        var playerDto = result.Value.Players[0];
        Assert.Equal(host.Id.Value, playerDto.PlayerId);
        Assert.Equal("Host", playerDto.DisplayName);
        Assert.False(playerDto.HasWon);
    }

    [Fact]
    public async Task HandleAsync_WithValidPlayer_MapsCard()
    {
        var room = SeedRoomWithCards();
        var host = room.Players[0];
        var query = new GetRoomStateQuery(room.Id.Value, host.Id.Value);

        var result = await _sut.HandleAsync(query);

        var card = result.Value.Players[0].Card;
        Assert.NotNull(card);
        Assert.Equal(5, card.MatrixSize);
        Assert.Equal(25, card.Squares.Count);
    }

    [Fact]
    public async Task HandleAsync_WithValidPlayer_MapsSquareProperties()
    {
        var room = SeedRoomWithCards();
        var host = room.Players[0];
        var query = new GetRoomStateQuery(room.Id.Value, host.Id.Value);

        var result = await _sut.HandleAsync(query);

        var square = result.Value.Players[0].Card!.Squares.First(s => s.Row == 0 && s.Column == 0);
        Assert.Equal("Event_0_0", square.DisplayText);
        Assert.Equal("EVENT_0_0", square.EventKey);
        Assert.False(square.IsFreeSpace);
        Assert.False(square.IsMarked);
        Assert.Null(square.MarkedBy);
        Assert.Null(square.MarkedAt);
    }

    [Fact]
    public async Task HandleAsync_WithValidPlayer_MapsFreeSpace()
    {
        var room = SeedRoomWithCards();
        var host = room.Players[0];
        var query = new GetRoomStateQuery(room.Id.Value, host.Id.Value);

        var result = await _sut.HandleAsync(query);

        var freeSpace = result.Value.Players[0].Card!.Squares.First(s => s.Row == 2 && s.Column == 2);
        Assert.Equal("FREE", freeSpace.DisplayText);
        Assert.Null(freeSpace.EventKey);
        Assert.True(freeSpace.IsFreeSpace);
        Assert.True(freeSpace.IsMarked);
    }

    [Fact]
    public async Task HandleAsync_WithValidPlayer_MapsEmptyLeaderboard()
    {
        var room = SeedRoomWithCards();
        var playerId = room.Players[0].Id.Value;
        var query = new GetRoomStateQuery(room.Id.Value, playerId);

        var result = await _sut.HandleAsync(query);

        Assert.Empty(result.Value.Leaderboard);
    }

    [Fact]
    public async Task HandleAsync_RoomNotFound_ReturnsNotFoundError()
    {
        var query = new GetRoomStateQuery(Guid.NewGuid(), Guid.NewGuid());

        var result = await _sut.HandleAsync(query);

        Assert.True(result.IsFailure);
        Assert.Equal("room_not_found", result.Error!.Code);
    }

    [Fact]
    public async Task HandleAsync_AsHost_SeesAllPlayersCards()
    {
        var room = SeedRoomWithTwoPlayers();
        var hostId = room.HostPlayerId.Value;
        var query = new GetRoomStateQuery(room.Id.Value, hostId);

        var result = await _sut.HandleAsync(query);

        Assert.True(result.IsSuccess);
        foreach (var player in result.Value.Players)
        {
            Assert.NotNull(player.Card);
        }
    }

    [Fact]
    public async Task HandleAsync_AsNonHost_SeesOnlyOwnCard()
    {
        var room = SeedRoomWithTwoPlayers();
        var aliceId = room.Players[1].Id.Value;
        var query = new GetRoomStateQuery(room.Id.Value, aliceId);

        var result = await _sut.HandleAsync(query);

        Assert.True(result.IsSuccess);
        var players = result.Value.Players;

        var aliceDto = players.First(p => p.PlayerId == aliceId);
        Assert.NotNull(aliceDto.Card);

        var hostDto = players.First(p => p.PlayerId == room.HostPlayerId.Value);
        Assert.Null(hostDto.Card);
    }

    private Room SeedRoomWithTwoPlayers()
    {
        var room = Room.Create("Host", DefaultSession);
        var alice = room.AddPlayer("Alice");
        room.Players[0].AssignCard(_cardGenerator.Generate(SessionType.Race, 5));
        alice.AssignCard(_cardGenerator.Generate(SessionType.Race, 5));
        _roomRepository.Seed(room);
        return room;
    }
}
