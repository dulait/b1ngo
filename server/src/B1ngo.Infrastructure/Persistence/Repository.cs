using B1ngo.Domain.Core;
using Microsoft.EntityFrameworkCore;

namespace B1ngo.Infrastructure.Persistence;

public abstract class Repository<TContext, TEntity, TId>(TContext dbContext) : IRepository<TEntity, TId>
    where TContext : DbContext
    where TEntity : Entity<TId>
    where TId : IEntityId
{
    protected readonly TContext DbContext = dbContext;

    public virtual async Task<TEntity?> GetByIdAsync(TId id, CancellationToken cancellationToken = default) =>
        await DbContext.Set<TEntity>().FindAsync([id], cancellationToken);

    public async Task<IReadOnlyList<TEntity>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await DbContext.Set<TEntity>().ToListAsync(cancellationToken);

    public async Task AddAsync(TEntity aggregate, CancellationToken cancellationToken = default) =>
        await DbContext.Set<TEntity>().AddAsync(aggregate, cancellationToken);

    public void Update(TEntity aggregate) => DbContext.Set<TEntity>().Update(aggregate);

    public void Remove(TEntity aggregate) => DbContext.Set<TEntity>().Remove(aggregate);
}
