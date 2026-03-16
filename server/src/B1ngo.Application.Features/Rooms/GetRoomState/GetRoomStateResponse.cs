namespace B1ngo.Application.Features.Rooms.GetRoomState;

public sealed record GetRoomStateResponse(
    Guid RoomId,
    string JoinCode,
    string Status,
    SessionDto Session,
    ConfigurationDto Configuration,
    Guid HostPlayerId,
    IReadOnlyList<PlayerDto> Players,
    IReadOnlyList<LeaderboardEntryDto> Leaderboard
);

public sealed record SessionDto(int Season, string GrandPrixName, string SessionType);

public sealed record ConfigurationDto(int MatrixSize, IReadOnlyList<string> WinningPatterns);

public sealed record PlayerDto(Guid PlayerId, string DisplayName, bool HasWon, CardDto? Card);

public sealed record CardDto(int MatrixSize, IReadOnlyList<SquareDto> Squares);

public sealed record SquareDto(
    int Row,
    int Column,
    string DisplayText,
    string? EventKey,
    bool IsFreeSpace,
    bool IsMarked,
    string? MarkedBy,
    DateTimeOffset? MarkedAt
);

public sealed record LeaderboardEntryDto(Guid PlayerId, int Rank, string WinningPattern, DateTimeOffset CompletedAt);
