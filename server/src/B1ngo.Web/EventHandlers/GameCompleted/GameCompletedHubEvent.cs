using B1ngo.Web.Hubs;

namespace B1ngo.Web.EventHandlers;

public sealed record GameCompletedHubEvent(Guid RoomId) : HubEvent;
