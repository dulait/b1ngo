using B1ngo.Web.Hubs;

namespace B1ngo.Web.EventHandlers;

public sealed record GameStartedHubEvent(Guid RoomId) : HubEvent;
