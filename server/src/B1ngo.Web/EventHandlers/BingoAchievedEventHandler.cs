using B1ngo.Application.Features.Rooms.GetRoomState;
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
                    domainEvent.WinningSquares
                        .Select(s => new SquarePositionDto(s.Row, s.Column))
                        .ToList(),
                    domainEvent.Rank,
                    domainEvent.CompletedAt
                ),
                cancellationToken
            );
    }
}
