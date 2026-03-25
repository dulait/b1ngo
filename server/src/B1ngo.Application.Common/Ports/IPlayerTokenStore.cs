namespace B1ngo.Application.Common.Ports;

public sealed record PlayerIdentity(Guid RoomId, Guid PlayerId, bool IsHost);

public interface IPlayerTokenStore
{
    Guid Create(Guid playerId, Guid roomId, bool isHost, Guid? userId = null);
    Task<PlayerIdentity?> ResolveAsync(Guid token, CancellationToken cancellationToken = default);
}
