namespace B1ngo.Application.Common.Ports;

public interface IUserActivityRepository
{
    Task<string> GetDisplayNameAsync(Guid userId, CancellationToken cancellationToken = default);

    Task<List<UserActiveRoomRecord>> GetActiveRoomsAsync(
        Guid userId,
        int? limit = null,
        CancellationToken cancellationToken = default
    );

    Task<int> GetActiveRoomCountAsync(Guid userId, CancellationToken cancellationToken = default);

    Task<UserStatsRecord> GetStatsAsync(Guid userId, CancellationToken cancellationToken = default);

    Task<List<UserCompletedRoomRecord>> GetCompletedRoomsPageAsync(
        Guid userId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default
    );

    Task<int> GetCompletedRoomCountAsync(Guid userId, CancellationToken cancellationToken = default);
}

public sealed record UserActiveRoomRecord(
    Guid RoomId,
    Guid PlayerId,
    string GpName,
    string SessionType,
    int PlayerCount,
    string Status,
    bool IsHost,
    DateTimeOffset JoinedAt
);

public sealed record UserCompletedRoomRecord(
    Guid RoomId,
    string GpName,
    string SessionType,
    int PlayerCount,
    DateTimeOffset CompletedAt,
    int? ResultRank,
    string? WinPattern
);

public sealed record UserStatsRecord(
    int GamesPlayed,
    int Wins,
    int RowWins,
    int ColumnWins,
    int DiagonalWins,
    int BlackoutWins,
    IReadOnlyDictionary<int, int> RankCounts
);
