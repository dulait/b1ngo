namespace B1ngo.Domain.Core;

public interface IAuditable
{
    Guid CreatedBy { get; set; }
    DateTimeOffset CreatedAt { get; set; }
    Guid? LastModifiedBy { get; set; }
    DateTimeOffset? LastModifiedAt { get; set; }
}
