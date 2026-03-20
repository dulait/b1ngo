namespace B1ngo.DataSync.Translation;

internal sealed record GrandPrixSeedEntry(string Name, int Season, int Round, bool IsSprint, List<string> SessionTypes);
