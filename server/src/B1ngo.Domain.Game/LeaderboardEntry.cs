namespace B1ngo.Domain.Game;

public sealed record LeaderboardEntry
{
    private readonly List<SquarePosition> _winningSquares = [];

    public PlayerId PlayerId { get; init; } = null!;
    public int Rank { get; internal set; }
    public WinPatternType WinningPattern { get; init; }
    public IReadOnlyList<SquarePosition> WinningSquares => _winningSquares;
    public DateTimeOffset CompletedAt { get; init; }

    public LeaderboardEntry(
        PlayerId playerId,
        int rank,
        WinPatternType winningPattern,
        IReadOnlyList<SquarePosition> winningSquares,
        DateTimeOffset completedAt
    )
    {
        PlayerId = playerId;
        Rank = rank;
        WinningPattern = winningPattern;
        _winningSquares = winningSquares.ToList();
        CompletedAt = completedAt;
    }

    private LeaderboardEntry() { }
}
