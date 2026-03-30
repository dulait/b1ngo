using System.Security.Claims;
using B1ngo.Application.Common.Ports;
using Microsoft.AspNetCore.SignalR;

namespace B1ngo.Web.Hubs;

public sealed class GameHub(IPlayerTokenStore playerTokenStore) : Hub
{
    public override async Task OnConnectedAsync()
    {
        var httpContext = Context.GetHttpContext();

        var identity = await ResolveFromCookie(httpContext);
        identity ??= await ResolveFromAuthenticatedUser(httpContext);

        if (identity is null)
        {
            Context.Abort();
            return;
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, $"room:{identity.RoomId}");
        await base.OnConnectedAsync();
    }

    private async Task<PlayerIdentity?> ResolveFromCookie(HttpContext? httpContext)
    {
        var tokenString = httpContext?.Request.Cookies["PlayerToken"];
        if (!Guid.TryParse(tokenString, out var token))
        {
            return null;
        }

        return await playerTokenStore.ResolveAsync(token);
    }

    private async Task<PlayerIdentity?> ResolveFromAuthenticatedUser(HttpContext? httpContext)
    {
        if (httpContext?.User.Identity?.IsAuthenticated != true)
        {
            return null;
        }

        var userIdClaim = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return null;
        }

        var roomIdString = httpContext.Request.Query["roomId"].FirstOrDefault();
        if (!Guid.TryParse(roomIdString, out var roomId))
        {
            return null;
        }

        return await playerTokenStore.ResolveByUserAndRoomAsync(userId, roomId);
    }
}
