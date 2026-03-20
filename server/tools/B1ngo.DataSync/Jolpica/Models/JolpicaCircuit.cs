using System.Text.Json.Serialization;

namespace B1ngo.DataSync.Jolpica.Models;

internal sealed class JolpicaCircuit
{
    [JsonPropertyName("circuitId")]
    public string CircuitId { get; set; } = null!;

    [JsonPropertyName("circuitName")]
    public string CircuitName { get; set; } = null!;

    [JsonPropertyName("Location")]
    public JolpicaLocation? Location { get; set; }
}

internal sealed class JolpicaLocation
{
    [JsonPropertyName("lat")]
    public string? Lat { get; set; }

    [JsonPropertyName("long")]
    public string? Long { get; set; }

    [JsonPropertyName("locality")]
    public string? Locality { get; set; }

    [JsonPropertyName("country")]
    public string? Country { get; set; }
}
