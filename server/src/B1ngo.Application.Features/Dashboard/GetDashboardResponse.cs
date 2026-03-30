namespace B1ngo.Application.Features.Dashboard;

public sealed record GetDashboardResponse(
    string DisplayName,
    IReadOnlyList<ActiveRoomDto> ActiveRooms,
    int TotalActiveRooms,
    QuickStatsDto QuickStats
);

public sealed record ActiveRoomDto(
    Guid RoomId,
    Guid PlayerId,
    string GpName,
    string SessionType,
    int PlayerCount,
    string Status,
    bool IsHost,
    DateTimeOffset JoinedAt
);

public sealed record QuickStatsDto(int GamesPlayed, int Wins, decimal WinRate)
{
    public static QuickStatsDto FromCounts(int gamesPlayed, int wins) =>
        new(gamesPlayed, wins, gamesPlayed > 0 ? Math.Round((decimal)wins / gamesPlayed, 4) : 0m);
}
