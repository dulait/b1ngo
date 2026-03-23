namespace B1ngo.Application.Common.Ports;

public interface ICurrentUserProvider
{
    Guid GetCurrentUserId();
}
