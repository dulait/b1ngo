namespace B1ngo.Domain.Game;

public sealed record LeaderboardEntry
{
    public PlayerId PlayerId { get; init; } = null!;
    public int Rank { get; init; }
    public WinPatternType WinningPattern { get; init; }
    public DateTimeOffset CompletedAt { get; init; }

    public LeaderboardEntry(PlayerId playerId, int rank, WinPatternType winningPattern, DateTimeOffset completedAt)
    {
        PlayerId = playerId;
        Rank = rank;
        WinningPattern = winningPattern;
        CompletedAt = completedAt;
    }

    private LeaderboardEntry() { }
}
