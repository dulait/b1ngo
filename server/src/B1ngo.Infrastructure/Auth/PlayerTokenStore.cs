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
        var tokens = dbContext.Set<PlayerToken>().AsNoTracking().Where(t => t.UserId == userId);
        var rooms = dbContext
            .Set<Domain.Game.Room>()
            .AsNoTracking()
            .Select(r => new { Id = r.Id.Value, Status = r.Status.ToString() });

        return await (
            from pt in tokens
            join r in rooms on pt.RoomId equals r.Id
            select new PlayerTokenSummary(pt.RoomId, r.Status)
        ).ToListAsync(cancellationToken);
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
