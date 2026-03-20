namespace B1ngo.Infrastructure.ReferenceData;

public sealed class GrandPrixEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public int Season { get; set; }
    public int Round { get; set; }
    public bool IsSprint { get; set; }
    public List<string> SessionTypes { get; set; } = [];
}
