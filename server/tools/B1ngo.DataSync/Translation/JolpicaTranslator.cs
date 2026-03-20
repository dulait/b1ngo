using B1ngo.DataSync.Jolpica.Models;

namespace B1ngo.DataSync.Translation;

internal sealed class JolpicaTranslator
{
    public IReadOnlyList<GrandPrixSeedEntry> Translate(IReadOnlyList<JolpicaRace> races)
    {
        return races.Select(TranslateRace).ToList();
    }

    private static GrandPrixSeedEntry TranslateRace(JolpicaRace race) =>
        new(
            Name: race.RaceName,
            Season: int.Parse(race.Season),
            Round: int.Parse(race.Round),
            IsSprint: race.Sprint is not null,
            SessionTypes: DeriveSessionTypes(race)
        );

    private static List<string> DeriveSessionTypes(JolpicaRace race)
    {
        if (race.Sprint is not null)
        {
            return ["FP1", "SprintQualifying", "Sprint", "Qualifying", "Race"];
        }

        return ["FP1", "FP2", "FP3", "Qualifying", "Race"];
    }
}
