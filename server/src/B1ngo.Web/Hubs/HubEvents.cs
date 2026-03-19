namespace B1ngo.Web.Hubs;

public sealed record PlayerJoinedHubEvent(Guid PlayerId, string DisplayName);

public sealed record GameStartedHubEvent(Guid RoomId);

public sealed record SquareMarkedHubEvent(Guid PlayerId, int Row, int Column, string MarkedBy, DateTimeOffset MarkedAt);

public sealed record SquareUnmarkedHubEvent(Guid PlayerId, int Row, int Column);

public sealed record BingoAchievedHubEvent(Guid PlayerId, string Pattern, int Rank, DateTimeOffset CompletedAt);

public sealed record GameCompletedHubEvent(Guid RoomId);
