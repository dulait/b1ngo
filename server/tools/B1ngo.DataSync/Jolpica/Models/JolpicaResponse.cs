using System.Text.Json.Serialization;

namespace B1ngo.DataSync.Jolpica.Models;

internal sealed class JolpicaResponse
{
    [JsonPropertyName("MRData")]
    public JolpicaMRData MRData { get; set; } = null!;
}

internal sealed class JolpicaMRData
{
    [JsonPropertyName("RaceTable")]
    public JolpicaRaceTable RaceTable { get; set; } = null!;
}

internal sealed class JolpicaRaceTable
{
    [JsonPropertyName("season")]
    public string Season { get; set; } = null!;

    [JsonPropertyName("Races")]
    public List<JolpicaRace> Races { get; set; } = [];
}
