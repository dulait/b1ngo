using B1ngo.Application.Common.Ports;
using Microsoft.AspNetCore.SignalR;

namespace B1ngo.Web.Hubs;

public sealed class GameHub(IPlayerTokenStore playerTokenStore) : Hub
{
    public override async Task OnConnectedAsync()
    {
        var httpContext = Context.GetHttpContext();
        var tokenString =
            httpContext?.Request.Query["access_token"].FirstOrDefault() ?? httpContext?.Request.Cookies["PlayerToken"];

        if (!Guid.TryParse(tokenString, out var token))
        {
            Context.Abort();
            return;
        }

        var identity = await playerTokenStore.ResolveAsync(token);
        if (identity is null)
        {
            Context.Abort();
            return;
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, $"room:{identity.RoomId}");
        await base.OnConnectedAsync();
    }
}
