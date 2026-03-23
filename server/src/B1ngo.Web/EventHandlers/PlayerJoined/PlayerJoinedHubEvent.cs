using B1ngo.Web.Hubs;

namespace B1ngo.Web.EventHandlers;

public sealed record PlayerJoinedHubEvent(Guid PlayerId, string DisplayName) : HubEvent;
