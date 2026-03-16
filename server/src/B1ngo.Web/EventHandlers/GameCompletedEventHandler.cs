using B1ngo.Domain.Core;
using B1ngo.Domain.Game.Events;
using B1ngo.Web.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace B1ngo.Web.EventHandlers;

internal sealed class GameCompletedEventHandler(
    IHubContext<GameHub> hubContext) : IDomainEventHandler<GameCompletedDomainEvent>
{
    public async Task HandleAsync(GameCompletedDomainEvent domainEvent, CancellationToken cancellationToken = default)
    {
        await hubContext.Clients
            .Group($"room:{domainEvent.RoomId.Value}")
            .SendAsync("GameCompleted", new
            {
                roomId = domainEvent.RoomId.Value
            }, cancellationToken);
    }
}
