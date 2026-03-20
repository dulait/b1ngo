namespace B1ngo.Infrastructure.ReferenceData;

public sealed class GrandPrixEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public int Season { get; set; }
    public int SortOrder { get; set; }
}
