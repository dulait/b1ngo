namespace B1ngo.Application.Features.Rooms.Reconnect;

public sealed record ReconnectResponse(Guid RoomId, Guid PlayerId, string RoomStatus);
