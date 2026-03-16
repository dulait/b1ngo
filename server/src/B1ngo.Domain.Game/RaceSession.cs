namespace B1ngo.Domain.Game;

public sealed record RaceSession
{
    public int Season { get; init; }
    public string GrandPrixName { get; init; } = null!;
    public SessionType SessionType { get; init; }

    private RaceSession() { }

    public RaceSession(int season, string grandPrixName, SessionType sessionType)
    {
        ArgumentOutOfRangeException.ThrowIfLessThan(season, 1950);
        ArgumentException.ThrowIfNullOrWhiteSpace(grandPrixName);

        Season = season;
        GrandPrixName = grandPrixName;
        SessionType = sessionType;
    }
}
