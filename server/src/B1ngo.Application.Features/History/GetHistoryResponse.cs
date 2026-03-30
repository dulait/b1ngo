using B1ngo.Application.Common.Pagination;

namespace B1ngo.Application.Features.History;

public sealed record GetHistoryResponse(
    IReadOnlyList<ActiveRoomDto> ActiveRooms,
    PagedResult<CompletedRoomDto> CompletedRooms
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

public sealed record CompletedRoomDto(
    Guid RoomId,
    string GpName,
    string SessionType,
    int PlayerCount,
    DateTimeOffset CompletedAt,
    int? ResultRank,
    string? WinPattern
);
