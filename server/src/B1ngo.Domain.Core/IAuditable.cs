namespace B1ngo.Domain.Core;

public interface IAuditable
{
    Guid CreatedBy { get; }
    DateTimeOffset CreatedAt { get; }
    Guid? LastModifiedBy { get; }
    DateTimeOffset? LastModifiedAt { get; }
}
