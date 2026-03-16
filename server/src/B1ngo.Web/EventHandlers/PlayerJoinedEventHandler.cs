using B1ngo.Domain.Core;
using B1ngo.Domain.Game.Events;
using B1ngo.Web.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace B1ngo.Web.EventHandlers;

internal sealed class PlayerJoinedEventHandler(IHubContext<GameHub> hubContext)
    : IDomainEventHandler<PlayerJoinedRoomDomainEvent>
{
    public async Task HandleAsync(
        PlayerJoinedRoomDomainEvent domainEvent,
        CancellationToken cancellationToken = default
    )
    {
        await hubContext
            .Clients.Group($"room:{domainEvent.RoomId.Value}")
            .SendAsync(
                "PlayerJoined",
                new { playerId = domainEvent.PlayerId.Value, displayName = domainEvent.DisplayName },
                cancellationToken
            );
    }
}
