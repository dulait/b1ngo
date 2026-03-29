using B1ngo.Application.Common.Cqrs;
using B1ngo.Application.Common.Ports;
using B1ngo.Application.Common.Results;

namespace B1ngo.Application.Features.Stats;

public sealed class GetStatsHandler(IUserActivityRepository userActivityRepository)
    : IQueryHandler<GetStatsQuery, GetStatsResponse>
{
    public async Task<Result<GetStatsResponse>> HandleAsync(
        GetStatsQuery query,
        CancellationToken cancellationToken = default
    )
    {
        var stats = await userActivityRepository.GetStatsAsync(query.UserId, cancellationToken);

        var overview = QuickStatsDto.FromCounts(stats.GamesPlayed, stats.Wins);

        var winsByPattern = new WinsByPatternDto(
            stats.RowWins,
            stats.ColumnWins,
            stats.DiagonalWins,
            stats.BlackoutWins
        );

        var bestFinishes = stats
            .RankCounts.Where(kv => kv.Value > 0)
            .OrderBy(kv => kv.Key)
            .Select(kv => new RankCountDto(kv.Key, kv.Value))
            .ToList();

        return Result.Ok(new GetStatsResponse(overview, winsByPattern, bestFinishes));
    }
}
