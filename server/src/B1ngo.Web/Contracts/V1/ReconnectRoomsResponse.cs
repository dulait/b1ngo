using B1ngo.Application.Common.Ports;

namespace B1ngo.Web.Contracts.V1;

public sealed record ReconnectRoomsResponse(List<PlayerTokenSummary> Rooms);
