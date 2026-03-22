using B1ngo.Domain.Core;

namespace B1ngo.Domain.Game.Events;

public sealed record SquareUnmarkedDomainEvent(RoomId RoomId, PlayerId PlayerId, int Row, int Column) : DomainEvent;
