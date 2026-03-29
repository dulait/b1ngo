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

    public async Task LinkTokenToUserAsync(Guid token, Guid userId, CancellationToken cancellationToken = default)
    {
        await dbContext
            .Set<PlayerToken>()
            .Where(t => t.Token == token && t.UserId == null)
            .ExecuteUpdateAsync(t => t.SetProperty(p => p.UserId, userId), cancellationToken);
    }

    public async Task<List<PlayerTokenSummary>> GetActiveTokensForUserAsync(
        Guid userId,
        CancellationToken cancellationToken = default
    )
    {
        var tokenRoomIds = await dbContext
            .Set<PlayerToken>()
            .AsNoTracking()
            .Where(t => t.UserId == userId)
            .Select(t => t.RoomId)
            .ToListAsync(cancellationToken);

        if (tokenRoomIds.Count == 0)
        {
            return [];
        }

        var roomIds = tokenRoomIds.Select(Domain.Game.RoomId.From).ToList();

        return await dbContext
            .Set<Domain.Game.Room>()
            .AsNoTracking()
            .Where(r => roomIds.Contains(r.Id))
            .Select(r => new PlayerTokenSummary(r.Id.Value, r.Status.ToString()))
            .ToListAsync(cancellationToken);
    }

    public async Task<PlayerIdentity?> ResolveByUserAndRoomAsync(
        Guid userId,
        Guid roomId,
        CancellationToken cancellationToken = default
    )
    {
        var playerToken = await dbContext
            .Set<PlayerToken>()
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.UserId == userId && t.RoomId == roomId, cancellationToken);

        if (playerToken is null)
        {
            return null;
        }

        return new PlayerIdentity(playerToken.RoomId, playerToken.PlayerId, playerToken.IsHost);
    }
}
