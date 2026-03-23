namespace B1ngo.Infrastructure.ReferenceData;

internal sealed class EventPoolEntryEntity
{
    public int Id { get; set; }
    public string SessionType { get; set; } = null!;
    public string EventKey { get; set; } = null!;
    public string DisplayText { get; set; } = null!;
}
