using B1ngo.Domain.Core;

namespace B1ngo.Domain.Game.Events;

public sealed record SquareMarkedDomainEvent(
    RoomId RoomId,
    PlayerId PlayerId,
    int Row,
    int Column,
    SquareMarkedBy MarkedBy,
    DateTimeOffset MarkedAt
) : DomainEvent;
