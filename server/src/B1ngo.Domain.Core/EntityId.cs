namespace B1ngo.Domain.Core;

public abstract record EntityId<TSelf>(Guid Value) : IEntityId
    where TSelf : EntityId<TSelf>
{
    public static TSelf New() => Create(Guid.NewGuid());
    public static TSelf From(Guid value) => Create(value);

    private static TSelf Create(Guid value) =>
        (TSelf)Activator.CreateInstance(typeof(TSelf), value)!;
}

public interface IEntityId
{
    Guid Value { get; }
}
