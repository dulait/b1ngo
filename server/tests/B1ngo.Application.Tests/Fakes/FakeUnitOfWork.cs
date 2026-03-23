using B1ngo.Application.Common.Ports;
using B1ngo.Application.Common.Results;

namespace B1ngo.Application.Tests.Fakes;

public sealed class FakeUnitOfWork : IUnitOfWork
{
    public int SaveChangesCallCount { get; private set; }

    public Task<Result> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        SaveChangesCallCount++;
        return Task.FromResult(Result.Ok());
    }
}
