using B1ngo.Application.Common.Cqrs;

namespace B1ngo.Application.Features.Rooms.Reconnect;

public sealed record ReconnectQuery(Guid RoomId, Guid PlayerId) : IQuery<ReconnectResponse>;
