using B1ngo.Web.Hubs;

namespace B1ngo.Web.EventHandlers;

public sealed record SquareUnmarkedHubEvent(Guid PlayerId, int Row, int Column) : HubEvent;
