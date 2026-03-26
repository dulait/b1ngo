using System.Security.Claims;
using B1ngo.Application.Common.Ports;

namespace B1ngo.Web.Services;

internal sealed class CurrentUserContext(IHttpContextAccessor httpContextAccessor) : ICurrentUserContext
{
    public Guid? GetAuthenticatedUserId()
    {
        var user = httpContextAccessor.HttpContext?.User;
        if (user?.Identity?.IsAuthenticated != true)
        {
            return null;
        }

        var claim = user.FindFirst(ClaimTypes.NameIdentifier);
        return claim is not null ? Guid.Parse(claim.Value) : null;
    }
}
