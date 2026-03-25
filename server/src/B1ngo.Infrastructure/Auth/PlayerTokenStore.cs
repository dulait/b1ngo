using B1ngo.Application.Common.Ports;
using B1ngo.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace B1ngo.Infrastructure.Auth;

internal sealed class PlayerTokenStore(B1ngoDbContext dbContext) : IPlayerTokenStore
{
    public Guid Create(Guid playerId, Guid roomId, bool isHost, Guid? userId = null)
    {
        var playerToken = PlayerToken.Create(playerId, roomId, isHost, userId);
        dbContext.Set<PlayerToken>().Add(playerToken);
        return playerToken.Token;
    }

    public async Task<PlayerIdentity?> ResolveAsync(Guid token, CancellationToken cancellationToken = default)
    {
        var playerToken = await dbContext
            .Set<PlayerToken>()
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Token == token, cancellationToken);

        if (playerToken is null)
        {
            return null;
        }

        return new PlayerIdentity(playerToken.RoomId, playerToken.PlayerId, playerToken.IsHost);
    }
}
