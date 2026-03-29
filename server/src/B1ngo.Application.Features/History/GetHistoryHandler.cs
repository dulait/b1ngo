using B1ngo.Application.Common.Cqrs;
using B1ngo.Application.Common.Pagination;
using B1ngo.Application.Common.Ports;
using B1ngo.Application.Common.Results;
using B1ngo.Application.Features.Dashboard;

namespace B1ngo.Application.Features.History;

public sealed class GetHistoryHandler(IUserActivityRepository userActivityRepository)
    : IQueryHandler<GetHistoryQuery, GetHistoryResponse>
{
    public async Task<Result<GetHistoryResponse>> HandleAsync(
        GetHistoryQuery query,
        CancellationToken cancellationToken = default
    )
    {
        var activeRooms = await userActivityRepository.GetActiveRoomsAsync(
            query.UserId,
            cancellationToken: cancellationToken
        );

        var completedRooms = await userActivityRepository.GetCompletedRoomsPageAsync(
            query.UserId,
            query.Page,
            query.PageSize,
            cancellationToken
        );

        var totalCompleted = await userActivityRepository.GetCompletedRoomCountAsync(query.UserId, cancellationToken);

        var activeRoomDtos = activeRooms
            .Select(r => new ActiveRoomDto(
                r.RoomId,
                r.PlayerId,
                r.GpName,
                r.SessionType,
                r.PlayerCount,
                r.Status,
                r.IsHost,
                r.JoinedAt
            ))
            .ToList();

        var completedRoomDtos = completedRooms
            .Select(r => new CompletedRoomDto(
                r.RoomId,
                r.GpName,
                r.SessionType,
                r.PlayerCount,
                r.CompletedAt,
                r.ResultRank,
                r.WinPattern
            ))
            .ToList();

        var pagedCompleted = new PagedResult<CompletedRoomDto>
        {
            Items = completedRoomDtos,
            Page = query.Page,
            PageSize = query.PageSize,
            TotalCount = totalCompleted,
        };

        return Result.Ok(new GetHistoryResponse(activeRoomDtos, pagedCompleted));
    }
}
