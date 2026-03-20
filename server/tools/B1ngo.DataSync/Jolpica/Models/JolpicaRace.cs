using System.Text.Json.Serialization;

namespace B1ngo.DataSync.Jolpica.Models;

internal sealed class JolpicaRace
{
    [JsonPropertyName("season")]
    public string Season { get; set; } = null!;

    [JsonPropertyName("round")]
    public string Round { get; set; } = null!;

    [JsonPropertyName("raceName")]
    public string RaceName { get; set; } = null!;

    [JsonPropertyName("Circuit")]
    public JolpicaCircuit? Circuit { get; set; }

    [JsonPropertyName("FirstPractice")]
    public JolpicaSessionSchedule? FirstPractice { get; set; }

    [JsonPropertyName("SecondPractice")]
    public JolpicaSessionSchedule? SecondPractice { get; set; }

    [JsonPropertyName("ThirdPractice")]
    public JolpicaSessionSchedule? ThirdPractice { get; set; }

    [JsonPropertyName("Qualifying")]
    public JolpicaSessionSchedule? Qualifying { get; set; }

    [JsonPropertyName("Sprint")]
    public JolpicaSessionSchedule? Sprint { get; set; }

    [JsonPropertyName("SprintShootout")]
    public JolpicaSessionSchedule? SprintShootout { get; set; }

    [JsonPropertyName("SprintQualifying")]
    public JolpicaSessionSchedule? SprintQualifying { get; set; }
}

internal sealed class JolpicaSessionSchedule
{
    [JsonPropertyName("date")]
    public string Date { get; set; } = null!;

    [JsonPropertyName("time")]
    public string? Time { get; set; }
}
