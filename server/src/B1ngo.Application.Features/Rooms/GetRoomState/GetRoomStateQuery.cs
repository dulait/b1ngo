using B1ngo.Application.Common.Cqrs;

namespace B1ngo.Application.Features.Rooms.GetRoomState;

public sealed record GetRoomStateQuery(Guid RoomId, Guid PlayerId) : IQuery<GetRoomStateResponse>;
