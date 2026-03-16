using B1ngo.Domain.Core;

namespace B1ngo.Domain.Game.Events;

public sealed record PlayerJoinedRoomDomainEvent(
    RoomId RoomId,
    PlayerId PlayerId,
    string DisplayName) : IDomainEvent;
