using B1ngo.Domain.Core;
using B1ngo.Domain.Game.Events;
using B1ngo.Web.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace B1ngo.Web.EventHandlers;

internal sealed class SquareMarkedEventHandler(IHubContext<GameHub> hubContext)
    : IDomainEventHandler<SquareMarkedDomainEvent>
{
    public async Task HandleAsync(SquareMarkedDomainEvent domainEvent, CancellationToken cancellationToken = default)
    {
        await hubContext
            .Clients.Group($"room:{domainEvent.RoomId.Value}")
            .SendAsync(
                "SquareMarked",
                new
                {
                    playerId = domainEvent.PlayerId.Value,
                    row = domainEvent.Row,
                    column = domainEvent.Column,
                    markedBy = domainEvent.MarkedBy.ToString(),
                },
                cancellationToken
            );
    }
}
