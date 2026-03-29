using B1ngo.Application.Features.Stats;

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
