using B1ngo.Domain.Core;
using B1ngo.Domain.Game.Events;
using B1ngo.Web.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace B1ngo.Web.EventHandlers;

internal sealed class BingoAchievedEventHandler(IHubContext<GameHub> hubContext)
    : IDomainEventHandler<BingoAchievedDomainEvent>
{
    public async Task HandleAsync(BingoAchievedDomainEvent domainEvent, CancellationToken cancellationToken = default)
    {
        await hubContext
            .Clients.Group($"room:{domainEvent.RoomId.Value}")
            .SendAsync(
                "BingoAchieved",
                new
                {
                    playerId = domainEvent.PlayerId.Value,
                    pattern = domainEvent.Pattern.ToString(),
                    rank = domainEvent.Rank,
                },
                cancellationToken
            );
    }
}
