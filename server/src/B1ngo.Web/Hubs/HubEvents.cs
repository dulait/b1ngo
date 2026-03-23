using B1ngo.Application.Features.Rooms.GetRoomState;

namespace B1ngo.Web.Hubs;

public abstract record HubEvent
{
    public Guid? CorrelationId { get; init; }

    public HubEvent WithCorrelationId(Guid? correlationId) => this with { CorrelationId = correlationId };
}

public sealed record PlayerJoinedHubEvent(Guid PlayerId, string DisplayName) : HubEvent;

public sealed record GameStartedHubEvent(Guid RoomId) : HubEvent;

public sealed record SquareMarkedHubEvent(Guid PlayerId, int Row, int Column, string MarkedBy, DateTimeOffset MarkedAt)
    : HubEvent;

public sealed record SquareUnmarkedHubEvent(Guid PlayerId, int Row, int Column) : HubEvent;

public sealed record BingoAchievedHubEvent(
    Guid PlayerId,
    string Pattern,
    IReadOnlyList<SquarePositionDto> WinningSquares,
    int Rank,
    DateTimeOffset CompletedAt
) : HubEvent;

public sealed record BingoRevokedHubEvent(Guid PlayerId) : HubEvent;

public sealed record GameCompletedHubEvent(Guid RoomId) : HubEvent;
