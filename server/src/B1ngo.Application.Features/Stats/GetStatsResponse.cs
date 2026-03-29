namespace B1ngo.Application.Features.Stats;

public sealed record GetStatsResponse(
    QuickStatsDto Overview,
    WinsByPatternDto WinsByPattern,
    IReadOnlyList<RankCountDto> BestFinishes
);

public sealed record QuickStatsDto(int GamesPlayed, int Wins, decimal WinRate);

public sealed record WinsByPatternDto(int Row, int Column, int Diagonal, int Blackout);

public sealed record RankCountDto(int Rank, int Count);
