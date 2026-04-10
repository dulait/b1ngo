using B1ngo.Application.Features.Rooms.GetRoomState;
using B1ngo.Web.Hubs;

namespace B1ngo.Web.EventHandlers;

public sealed record BingoAchievedHubEvent(
    Guid PlayerId,
    string Pattern,
    IReadOnlyList<SquarePositionDto> WinningSquares,
    int Rank,
    DateTimeOffset CompletedAt,
    string ElapsedTime,
    string? IntervalToPrevious
) : HubEvent;
