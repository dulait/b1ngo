namespace B1ngo.Domain.Core;

public interface IDomainEvent
{
    DateTimeOffset OccurredAt { get; }
    Guid? CorrelationId { get; set; }
}

public abstract record DomainEvent : IDomainEvent
{
    public DateTimeOffset OccurredAt { get; } = DateTimeOffset.UtcNow;
    public Guid? CorrelationId { get; set; }
}
