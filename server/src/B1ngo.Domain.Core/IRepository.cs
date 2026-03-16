namespace B1ngo.Domain.Core;

public interface IRepository<TEntity, in TId>
    where TEntity : Entity<TId>
    where TId : IEntityId
{
    Task<TEntity?> GetByIdAsync(TId id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TEntity>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(TEntity aggregate, CancellationToken cancellationToken = default);
    void Update(TEntity aggregate);
    void Remove(TEntity aggregate);
}
