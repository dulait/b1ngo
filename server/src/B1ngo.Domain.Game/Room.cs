using B1ngo.Domain.Core;
using B1ngo.Domain.Game.Events;

namespace B1ngo.Domain.Game;

public class Room : Entity<RoomId>
{
    private const int JoinCodeLength = 6;
    private const string JoinCodeAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    private readonly List<Player> _players = [];
    private readonly List<LeaderboardEntry> _leaderboard = [];

    public string JoinCode { get; private set; } = null!;
    public RoomStatus Status { get; private set; }
    public PlayerId HostPlayerId { get; private set; } = null!;
    public RaceSession Session { get; private set; } = null!;
    public RoomConfiguration Configuration { get; private set; } = null!;
    public IReadOnlyList<Player> Players => _players.AsReadOnly();
    public IReadOnlyList<LeaderboardEntry> Leaderboard => _leaderboard.AsReadOnly();

    private Room() { }

    private Room(RoomId id, string joinCode, RaceSession session, RoomConfiguration configuration)
        : base(id)
    {
        JoinCode = joinCode;
        Status = RoomStatus.Lobby;
        Session = session;
        Configuration = configuration;
    }

    public static Room Create(string hostDisplayName, RaceSession session, RoomConfiguration? configuration = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(hostDisplayName);
        ArgumentNullException.ThrowIfNull(session);

        var config = configuration ?? RoomConfiguration.Default;
        var id = RoomId.New();
        var joinCode = DeriveJoinCode(id);
        var room = new Room(id, joinCode, session, config);

        var host = Player.Create(hostDisplayName);
        room._players.Add(host);
        room.HostPlayerId = host.Id;

        room.RaiseDomainEvent(new RoomCreatedDomainEvent(room.Id, joinCode));
        room.RaiseDomainEvent(new PlayerJoinedRoomDomainEvent(room.Id, host.Id, hostDisplayName));

        return room;
    }

    public Player AddPlayer(string displayName)
    {
        EnsureStatus(RoomStatus.Lobby, "add players");
        ArgumentException.ThrowIfNullOrWhiteSpace(displayName);

        if (_players.Count >= Configuration.MaxPlayers)
        {
            throw new DomainConflictException(
                "room_full",
                $"This room has reached the maximum of {Configuration.MaxPlayers} players."
            );
        }

        if (HasPlayerWithDisplayName(displayName))
        {
            throw new DomainConflictException(
                "display_name_taken",
                $"A player with display name '{displayName}' already exists in this room."
            );
        }

        var player = Player.Create(displayName);
        _players.Add(player);
        RaiseDomainEvent(new PlayerJoinedRoomDomainEvent(Id, player.Id, displayName));

        return player;
    }

    public void StartGame()
    {
        EnsureStatus(RoomStatus.Lobby, "start the game");

        foreach (var player in _players.Where(player => player.Card is null))
        {
            throw new DomainConflictException(
                "players_missing_cards",
                $"Player '{player.DisplayName}' does not have a card assigned. All players must have cards before starting."
            );
        }

        Status = RoomStatus.Active;
        RaiseDomainEvent(new GameStartedDomainEvent(Id));
    }

    public void EndGame()
    {
        EnsureStatus(RoomStatus.Active, "end the game");

        Status = RoomStatus.Completed;
        RaiseDomainEvent(new GameCompletedDomainEvent(Id));
    }

    public void MarkSquare(PlayerId playerId, int row, int column, SquareMarkedBy markedBy, DateTimeOffset utcNow)
    {
        EnsureStatus(RoomStatus.Active, "mark squares");

        var player = GetPlayerOrThrow(playerId);

        if (player.Card is null)
        {
            throw new DomainConflictException("card_not_assigned", "Player does not have a card assigned.");
        }

        player.Card.MarkSquare(row, column, markedBy, utcNow);
        RaiseDomainEvent(new SquareMarkedDomainEvent(Id, playerId, row, column, markedBy, utcNow));
    }

    public WinResult? EvaluateWin(PlayerId playerId, DateTimeOffset utcNow)
    {
        var player = GetPlayerOrThrow(playerId);

        if (player.HasWon || player.Card is null)
        {
            return null;
        }

        var detection = player.Card.CheckForWin(Configuration.WinningPatterns);
        if (detection is null)
        {
            return null;
        }

        var rank = _leaderboard.Count + 1;
        _leaderboard.Add(new LeaderboardEntry(playerId, rank, detection.Pattern, detection.Squares, utcNow));
        player.SetWon();
        RaiseDomainEvent(new BingoAchievedDomainEvent(Id, playerId, detection.Pattern, detection.Squares, rank, utcNow));

        return new WinResult(detection.Pattern, rank);
    }

    public void UnmarkSquare(PlayerId playerId, int row, int column)
    {
        EnsureStatus(RoomStatus.Active, "unmark squares");

        var player = GetPlayerOrThrow(playerId);

        if (player.Card is null)
        {
            throw new DomainConflictException("card_not_assigned", "Player does not have a card assigned.");
        }

        player.Card.UnmarkSquare(row, column);
        RaiseDomainEvent(new SquareUnmarkedDomainEvent(Id, playerId, row, column));
    }

    public bool ReevaluateWin(PlayerId playerId)
    {
        var player = GetPlayerOrThrow(playerId);

        if (!player.HasWon || player.Card is null)
        {
            return false;
        }

        var stillHasWin = player.Card.CheckForWin(Configuration.WinningPatterns) is not null;
        if (stillHasWin)
        {
            return false;
        }

        player.RevokeWin();
        RemoveFromLeaderboard(playerId);
        RaiseDomainEvent(new BingoRevokedDomainEvent(Id, playerId));
        return true;
    }

    public void EditSquare(PlayerId playerId, int row, int column, string newDisplayText)
    {
        EnsureStatus(RoomStatus.Lobby, "edit squares");

        var player = GetPlayerOrThrow(playerId);

        if (player.Card is null)
        {
            throw new DomainConflictException("card_not_assigned", "Player does not have a card assigned.");
        }

        player.Card.EditSquare(row, column, newDisplayText);
    }

    public Player GetHost() =>
        _players.Find(p => p.Id == HostPlayerId)
        ?? throw new DomainNotFoundException("host_not_found", "Host player not found in room.");

    public bool HasPlayerWithDisplayName(string displayName) =>
        _players.Exists(p => string.Equals(p.DisplayName, displayName, StringComparison.OrdinalIgnoreCase));

    private Player GetPlayerOrThrow(PlayerId playerId) =>
        _players.Find(p => p.Id == playerId)
        ?? throw new DomainNotFoundException(
            "player_not_found",
            $"Player with ID '{playerId.Value}' not found in this room."
        );

    private void EnsureStatus(RoomStatus required, string action)
    {
        if (Status == required)
        {
            return;
        }

        var code = required switch
        {
            RoomStatus.Lobby => "room_not_in_lobby",
            RoomStatus.Active => "room_not_active",
            _ => "room_wrong_status",
        };
        throw new DomainConflictException(
            code,
            $"Cannot {action} — room is in '{Status}' state, expected '{required}'."
        );
    }

    private void RemoveFromLeaderboard(PlayerId playerId)
    {
        _leaderboard.RemoveAll(e => e.PlayerId == playerId);

        for (var i = 0; i < _leaderboard.Count; i++)
        {
            _leaderboard[i].Rank = i + 1;
        }
    }

    private static string DeriveJoinCode(RoomId id)
    {
        var bytes = id.Value.ToByteArray();
        return string.Create(
            JoinCodeLength,
            bytes,
            static (span, bytes) =>
            {
                for (var i = 0; i < span.Length; i++)
                {
                    span[i] = JoinCodeAlphabet[bytes[i] % JoinCodeAlphabet.Length];
                }
            }
        );
    }
}

public sealed record RoomId(Guid Value) : EntityId<RoomId>(Value);
