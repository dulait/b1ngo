using B1ngo.Application.Common.Ports;

namespace B1ngo.Application.Tests.Fakes;

public sealed class FakeCurrentUserContext : ICurrentUserContext
{
    public Guid? AuthenticatedUserId { get; set; }

    public Guid? GetAuthenticatedUserId() => AuthenticatedUserId;
}
