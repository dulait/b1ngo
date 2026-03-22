using B1ngo.Domain.Core;

namespace B1ngo.Domain.Game.Events;

public sealed record RoomCreatedDomainEvent(RoomId RoomId, string JoinCode) : DomainEvent;
