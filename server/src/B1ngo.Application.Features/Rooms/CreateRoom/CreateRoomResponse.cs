using System.Text.Json.Serialization;

namespace B1ngo.Application.Features.Rooms.CreateRoom;

public sealed record CreateRoomResponse(
    Guid RoomId,
    string JoinCode,
    Guid PlayerId,
    [property: JsonIgnore] Guid PlayerToken
);
