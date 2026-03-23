using B1ngo.Application.Common.Ports;
using B1ngo.Web.Filters;

namespace B1ngo.Web.Services;

internal sealed class CurrentUserProvider(IHttpContextAccessor httpContextAccessor) : ICurrentUserProvider
{
    public Guid GetCurrentUserId()
    {
        var identity =
            httpContextAccessor.HttpContext?.Items[PlayerTokenAuthFilter.PlayerIdentityKey] as PlayerIdentity;

        return identity?.PlayerId ?? Guid.Empty;
    }
}
