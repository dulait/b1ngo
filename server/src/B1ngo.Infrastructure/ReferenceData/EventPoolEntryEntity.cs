namespace B1ngo.Infrastructure.ReferenceData;

public sealed class EventPoolEntryEntity
{
    public int Id { get; set; }
    public int SessionTypeId { get; set; }
    public string EventKey { get; set; } = null!;
    public string DisplayText { get; set; } = null!;

    public SessionTypeEntity SessionType { get; set; } = null!;
}
