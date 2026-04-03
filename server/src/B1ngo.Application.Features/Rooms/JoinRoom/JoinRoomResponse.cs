using System.Text.Json.Serialization;

namespace B1ngo.Application.Features.Rooms.JoinRoom;

public sealed record JoinRoomResponse(
    Guid RoomId,
    Guid PlayerId,
    [property: JsonIgnore] Guid PlayerToken,
    string DisplayName
);
