namespace B1ngo.Web.Contracts.V1;

public sealed record ReconnectRoomSummary(Guid RoomId, string RoomStatus);

public sealed record ReconnectRoomsResponse(List<ReconnectRoomSummary> Rooms);
