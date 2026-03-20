namespace B1ngo.Infrastructure.ReferenceData;

public sealed class SessionTypeEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string DisplayName { get; set; } = null!;
    public int SortOrder { get; set; }
}
