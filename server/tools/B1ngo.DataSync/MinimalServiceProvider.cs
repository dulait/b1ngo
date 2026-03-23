using B1ngo.Application.Common.Ports;

namespace B1ngo.DataSync;

/// <summary>
/// Minimal implementations for DataSync tool. The DbContext requires ICurrentUserProvider
/// and IServiceProvider, but the sync tool doesn't dispatch domain events or audit entities.
/// </summary>
internal sealed class MinimalServiceProvider : ICurrentUserProvider, IServiceProvider
{
    public Guid GetCurrentUserId() => Guid.Empty;

    public object? GetService(Type serviceType) => null;
}
