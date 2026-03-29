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

        var winRate = stats.GamesPlayed > 0 ? (decimal)stats.Wins / stats.GamesPlayed : 0m;

        var overview = new QuickStatsDto(stats.GamesPlayed, stats.Wins, Math.Round(winRate, 4));

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
