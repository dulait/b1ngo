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
                new BingoAchievedHubEvent(
                    domainEvent.PlayerId.Value,
                    domainEvent.Pattern.ToString(),
                    domainEvent.Rank,
                    domainEvent.CompletedAt
                ),
                cancellationToken
            );
    }
}
