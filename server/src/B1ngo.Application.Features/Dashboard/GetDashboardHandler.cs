using B1ngo.Application.Common.Cqrs;
using B1ngo.Application.Common.Ports;
using B1ngo.Application.Common.Results;

namespace B1ngo.Application.Features.Dashboard;

public sealed class GetDashboardHandler(IUserActivityRepository userActivityRepository)
    : IQueryHandler<GetDashboardQuery, GetDashboardResponse>
{
    public async Task<Result<GetDashboardResponse>> HandleAsync(
        GetDashboardQuery query,
        CancellationToken cancellationToken = default
    )
    {
        var displayName = await userActivityRepository.GetDisplayNameAsync(query.UserId, cancellationToken);
        var activeRooms = await userActivityRepository.GetActiveRoomsAsync(query.UserId, limit: 5, cancellationToken);
        var totalActiveRooms = await userActivityRepository.GetActiveRoomCountAsync(query.UserId, cancellationToken);
        var quickStatsRecord = await userActivityRepository.GetQuickStatsAsync(query.UserId, cancellationToken);

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

        var quickStats = QuickStatsDto.FromCounts(quickStatsRecord.GamesPlayed, quickStatsRecord.Wins);

        return Result.Ok(new GetDashboardResponse(displayName, activeRoomDtos, totalActiveRooms, quickStats));
    }
}
