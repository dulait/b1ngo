namespace B1ngo.Application.Common.Ports;

public sealed record PlayerIdentity(Guid RoomId, Guid PlayerId, bool IsHost);

public sealed record PlayerTokenSummary(Guid RoomId, string RoomStatus);

public interface IPlayerTokenStore
{
    Guid Create(Guid playerId, Guid roomId, bool isHost, Guid? userId = null);
    Task<PlayerIdentity?> ResolveAsync(Guid token, CancellationToken cancellationToken = default);
    Task LinkTokenToUserAsync(Guid token, Guid userId, CancellationToken cancellationToken = default);
    Task<List<PlayerTokenSummary>> GetActiveTokensForUserAsync(
        Guid userId,
        CancellationToken cancellationToken = default
    );
    Task<PlayerIdentity?> ResolveByUserAndRoomAsync(
        Guid userId,
        Guid roomId,
        CancellationToken cancellationToken = default
    );
}
