using B1ngo.Web.Hubs;

namespace B1ngo.Web.EventHandlers;

public sealed record SquareMarkedHubEvent(Guid PlayerId, int Row, int Column, string MarkedBy, DateTimeOffset MarkedAt)
    : HubEvent;
