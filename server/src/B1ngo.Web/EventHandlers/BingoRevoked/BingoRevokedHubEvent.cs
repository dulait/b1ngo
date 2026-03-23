using B1ngo.Web.Hubs;

namespace B1ngo.Web.EventHandlers;

public sealed record BingoRevokedHubEvent(Guid PlayerId) : HubEvent;
