using B1ngo.Application.Common.Results;

namespace B1ngo.Application.Common.Ports;

public interface IUnitOfWork
{
    Task<Result> SaveChangesAsync(CancellationToken cancellationToken = default);
}
