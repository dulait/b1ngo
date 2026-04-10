using System.Security.Claims;
using B1ngo.Application.Common.Ports;
using Microsoft.AspNetCore.SignalR;

namespace B1ngo.Web.Hubs;

public sealed class GameHub(IPlayerTokenStore playerTokenStore) : Hub
{
    public override async Task OnConnectedAsync()
    {
        var httpContext = Context.GetHttpContext();
        var roomId = ParseRoomId(httpContext);

        var identity = await ResolveFromCookie(httpContext, roomId);
        identity ??= await ResolveFromAuthenticatedUser(httpContext, roomId);

        if (identity is null)
        {
            Context.Abort();
            return;
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, $"room:{identity.RoomId}");
        await Clients.Caller.SendAsync("Connected");
        await base.OnConnectedAsync();
    }

    private static Guid? ParseRoomId(HttpContext? httpContext)
    {
        var roomIdString = httpContext?.Request.Query["roomId"].FirstOrDefault();
        return Guid.TryParse(roomIdString, out var roomId) ? roomId : null;
    }

    private async Task<PlayerIdentity?> ResolveFromCookie(HttpContext? httpContext, Guid? expectedRoomId)
    {
        var tokenString = httpContext?.Request.Cookies[Constants.CookieNames.PlayerToken];
        if (!Guid.TryParse(tokenString, out var token))
        {
            return null;
        }

        var identity = await playerTokenStore.ResolveAsync(token);

        if (identity is not null && expectedRoomId.HasValue && identity.RoomId != expectedRoomId.Value)
        {
            return null;
        }

        return identity;
    }

    private async Task<PlayerIdentity?> ResolveFromAuthenticatedUser(HttpContext? httpContext, Guid? roomId)
    {
        if (httpContext?.User.Identity?.IsAuthenticated != true || !roomId.HasValue)
        {
            return null;
        }

        var userIdClaim = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return null;
        }

        return await playerTokenStore.ResolveByUserAndRoomAsync(userId, roomId.Value);
    }
}
