namespace B1ngo.Application.Common;

public sealed record PlayerIdentity(Guid RoomId, Guid PlayerId, bool IsHost);

public interface IPlayerTokenStore
{
    Guid Create(Guid playerId, Guid roomId, bool isHost);
    Task<PlayerIdentity?> ResolveAsync(Guid token, CancellationToken cancellationToken = default);
}
