namespace B1ngo.Application.Features.Rooms.JoinRoom;

public sealed record JoinRoomResponse(Guid RoomId, Guid PlayerId, Guid PlayerToken, string DisplayName);
