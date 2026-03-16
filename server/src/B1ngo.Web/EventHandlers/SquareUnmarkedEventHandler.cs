using B1ngo.Domain.Core;
using B1ngo.Domain.Game.Events;
using B1ngo.Web.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace B1ngo.Web.EventHandlers;

internal sealed class SquareUnmarkedEventHandler(IHubContext<GameHub> hubContext)
    : IDomainEventHandler<SquareUnmarkedDomainEvent>
{
    public async Task HandleAsync(SquareUnmarkedDomainEvent domainEvent, CancellationToken cancellationToken = default)
    {
        await hubContext
            .Clients.Group($"room:{domainEvent.RoomId.Value}")
            .SendAsync(
                "SquareUnmarked",
                new
                {
                    playerId = domainEvent.PlayerId.Value,
                    row = domainEvent.Row,
                    column = domainEvent.Column,
                },
                cancellationToken
            );
    }
}
