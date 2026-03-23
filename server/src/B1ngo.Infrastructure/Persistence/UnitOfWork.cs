using B1ngo.Application.Common.Ports;
using B1ngo.Application.Common.Results;
using Microsoft.EntityFrameworkCore;

namespace B1ngo.Infrastructure.Persistence;

internal sealed class UnitOfWork(B1ngoDbContext dbContext) : IUnitOfWork
{
    public async Task<Result> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return Result.Ok();
        }
        catch (DbUpdateConcurrencyException)
        {
            return Result.Fail(
                Error.Conflict("concurrency_conflict", "The room was modified by another request. Please try again.")
            );
        }
    }
}
