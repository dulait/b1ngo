using B1ngo.Application.Common.Pagination;
using B1ngo.Application.Features.Dashboard;

namespace B1ngo.Application.Features.History;

public sealed record GetHistoryResponse(
    IReadOnlyList<ActiveRoomDto> ActiveRooms,
    PagedResult<CompletedRoomDto> CompletedRooms
);

public sealed record CompletedRoomDto(
    Guid RoomId,
    string GpName,
    string SessionType,
    int PlayerCount,
    DateTimeOffset CompletedAt,
    int? ResultRank,
    string? WinPattern
);
