namespace B1ngo.Domain.Game.Tests.Helpers;

/// <summary>
/// Builds Room instances for tests. Provides defaults for all required fields
/// and helper methods for common test scenarios.
/// </summary>
internal sealed class RoomBuilder
{
    private string _hostDisplayName = "Host";
    private RaceSession _session = new(2026, "Bahrain Grand Prix", SessionType.Race);
    private RoomConfiguration? _configuration;

    public RoomBuilder WithHostDisplayName(string name)
    {
        _hostDisplayName = name;
        return this;
    }

    public RoomBuilder WithSession(RaceSession session)
    {
        _session = session;
        return this;
    }

    public RoomBuilder WithConfiguration(RoomConfiguration configuration)
    {
        _configuration = configuration;
        return this;
    }

    public Room Build() => Room.Create(_hostDisplayName, _session, _configuration);
}
