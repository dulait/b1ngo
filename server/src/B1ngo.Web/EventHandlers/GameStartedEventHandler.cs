using B1ngo.Domain.Core;
using B1ngo.Domain.Game.Events;
using B1ngo.Web.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace B1ngo.Web.EventHandlers;

internal sealed class GameStartedEventHandler(IHubContext<GameHub> hubContext)
    : IDomainEventHandler<GameStartedDomainEvent>
{
    public async Task HandleAsync(GameStartedDomainEvent domainEvent, CancellationToken cancellationToken = default)
    {
        await hubContext
            .Clients.Group($"room:{domainEvent.RoomId.Value}")
            .SendAsync("GameStarted", new GameStartedHubEvent(domainEvent.RoomId.Value), cancellationToken);
    }
}
