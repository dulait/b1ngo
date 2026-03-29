namespace B1ngo.Application.Features.Stats;

public sealed record GetStatsResponse(
    QuickStatsDto Overview,
    WinsByPatternDto WinsByPattern,
    IReadOnlyList<RankCountDto> BestFinishes
);

public sealed record QuickStatsDto(int GamesPlayed, int Wins, decimal WinRate)
{
    public static QuickStatsDto FromCounts(int gamesPlayed, int wins) =>
        new(gamesPlayed, wins, gamesPlayed > 0 ? Math.Round((decimal)wins / gamesPlayed, 4) : 0m);
}

public sealed record WinsByPatternDto(int Row, int Column, int Diagonal, int Blackout);

public sealed record RankCountDto(int Rank, int Count);
