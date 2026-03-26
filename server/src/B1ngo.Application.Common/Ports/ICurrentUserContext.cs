namespace B1ngo.Application.Common.Ports;

public interface ICurrentUserContext
{
    Guid? GetAuthenticatedUserId();
}
