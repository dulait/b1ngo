using B1ngo.Domain.Core;
using B1ngo.Domain.Game.Events;
using B1ngo.Web.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace B1ngo.Web.EventHandlers;

internal sealed class BingoRevokedEventHandler(IHubContext<GameHub> hubContext)
    : IDomainEventHandler<BingoRevokedDomainEvent>
{
    public async Task HandleAsync(BingoRevokedDomainEvent domainEvent, CancellationToken cancellationToken = default)
    {
        await hubContext
            .Clients.Group($"room:{domainEvent.RoomId.Value}")
            .SendAsync("BingoRevoked", new BingoRevokedHubEvent(domainEvent.PlayerId.Value), cancellationToken);
    }
}
