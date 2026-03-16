namespace B1ngo.Domain.Core;

public abstract class Entity<TId> : IHasDomainEvents, IAuditable, IEquatable<Entity<TId>>
    where TId : IEntityId
{
    private readonly List<IDomainEvent> _domainEvents = [];

    public TId Id { get; protected init; } = default!;

    public Guid CreatedBy { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public Guid? LastModifiedBy { get; private set; }
    public DateTimeOffset? LastModifiedAt { get; private set; }

    Guid IAuditable.CreatedBy
    {
        get => CreatedBy;
        set => CreatedBy = value;
    }
    DateTimeOffset IAuditable.CreatedAt
    {
        get => CreatedAt;
        set => CreatedAt = value;
    }
    Guid? IAuditable.LastModifiedBy
    {
        get => LastModifiedBy;
        set => LastModifiedBy = value;
    }
    DateTimeOffset? IAuditable.LastModifiedAt
    {
        get => LastModifiedAt;
        set => LastModifiedAt = value;
    }

    protected Entity() { }

    protected Entity(TId id)
    {
        Id = id;
    }

    public IReadOnlyList<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    protected void RaiseDomainEvent(IDomainEvent domainEvent) => _domainEvents.Add(domainEvent);

    public void ClearDomainEvents() => _domainEvents.Clear();

    public bool Equals(Entity<TId>? other)
    {
        if (other is null)
        {
            return false;
        }

        if (ReferenceEquals(this, other))
        {
            return true;
        }

        return GetType() == other.GetType() && Id.Equals(other.Id);
    }

    public override bool Equals(object? obj) => obj is Entity<TId> entity && Equals(entity);

    public override int GetHashCode() => HashCode.Combine(GetType(), Id);

    public static bool operator ==(Entity<TId>? left, Entity<TId>? right) => left?.Equals(right) ?? right is null;

    public static bool operator !=(Entity<TId>? left, Entity<TId>? right) => !(left == right);
}
