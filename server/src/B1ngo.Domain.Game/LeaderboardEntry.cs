namespace B1ngo.Domain.Game;

public sealed record LeaderboardEntry
{
    public PlayerId PlayerId { get; init; } = null!;
    public int Rank { get; init; }
    public WinPatternType WinningPattern { get; init; }
    public IReadOnlyList<SquarePosition> WinningSquares { get; init; } = [];
    public DateTimeOffset CompletedAt { get; init; }

    public LeaderboardEntry(
        PlayerId playerId,
        int rank,
        WinPatternType winningPattern,
        IReadOnlyList<SquarePosition> winningSquares,
        DateTimeOffset completedAt)
    {
        PlayerId = playerId;
        Rank = rank;
        WinningPattern = winningPattern;
        WinningSquares = winningSquares;
        CompletedAt = completedAt;
    }

    private LeaderboardEntry() { }
}
