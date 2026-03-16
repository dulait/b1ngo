using B1ngo.Domain.Core;

namespace B1ngo.Infrastructure.Persistence;

internal sealed class UnitOfWork(B1ngoDbContext dbContext) : IUnitOfWork
{
    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        dbContext.SaveChangesAsync(cancellationToken);
}
