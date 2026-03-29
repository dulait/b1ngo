using B1ngo.Application.Common.Ports;
using B1ngo.Domain.Game;
using B1ngo.Infrastructure.Auth;
using B1ngo.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;

namespace B1ngo.Infrastructure.Persistence;

internal sealed class UserActivityRepository(B1ngoDbContext dbContext) : IUserActivityRepository
{
    public async Task<string> GetDisplayNameAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await dbContext
            .Set<ApplicationUser>()
            .AsNoTracking()
            .Where(u => u.Id == userId)
            .Select(u => u.DisplayName)
            .FirstOrDefaultAsync(cancellationToken);

        return user ?? "Player";
    }

    public async Task<List<UserActiveRoomRecord>> GetActiveRoomsAsync(
        Guid userId,
        int? limit = null,
        CancellationToken cancellationToken = default
    )
    {
        var query = dbContext
            .Set<PlayerToken>()
            .AsNoTracking()
            .Where(pt => pt.UserId == userId)
            .Join(
                dbContext.Rooms.AsNoTracking().Include(r => r.Players),
                pt => pt.RoomId,
                r => r.Id.Value,
                (pt, r) => new { pt, r }
            )
            .Where(x => x.r.Status == RoomStatus.Lobby || x.r.Status == RoomStatus.Active)
            .OrderByDescending(x => x.pt.CreatedAt)
            .Select(x => new UserActiveRoomRecord(
                x.r.Id.Value,
                x.pt.PlayerId,
                x.r.Session.GrandPrixName,
                x.r.Session.SessionType.ToString(),
                x.r.Players.Count,
                x.r.Status.ToString(),
                x.pt.IsHost,
                x.pt.CreatedAt
            ));

        if (limit.HasValue)
        {
            query = query.Take(limit.Value);
        }

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<int> GetActiveRoomCountAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await dbContext
            .Set<PlayerToken>()
            .AsNoTracking()
            .Where(pt => pt.UserId == userId)
            .Join(dbContext.Rooms.AsNoTracking(), pt => pt.RoomId, r => r.Id.Value, (pt, r) => r)
            .Where(r => r.Status == RoomStatus.Lobby || r.Status == RoomStatus.Active)
            .CountAsync(cancellationToken);
    }

    public async Task<List<UserCompletedRoomRecord>> GetCompletedRoomsPageAsync(
        Guid userId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default
    )
    {
        var userTokens = dbContext.Set<PlayerToken>().AsNoTracking().Where(pt => pt.UserId == userId);

        var completedRooms = await userTokens
            .Join(
                dbContext.Rooms.AsNoTracking().Include(r => r.Players),
                pt => pt.RoomId,
                r => r.Id.Value,
                (pt, r) => new { pt, r }
            )
            .Where(x => x.r.Status == RoomStatus.Completed)
            .OrderByDescending(x => x.r.LastModifiedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return completedRooms
            .Select(x =>
            {
                var leaderboardEntry = x.r.Leaderboard.FirstOrDefault(e => e.PlayerId == PlayerId.From(x.pt.PlayerId));

                return new UserCompletedRoomRecord(
                    x.r.Id.Value,
                    x.r.Session.GrandPrixName,
                    x.r.Session.SessionType.ToString(),
                    x.r.Players.Count,
                    x.r.LastModifiedAt ?? x.r.CreatedAt,
                    leaderboardEntry?.Rank,
                    leaderboardEntry?.WinningPattern.ToString()
                );
            })
            .ToList();
    }

    public async Task<int> GetCompletedRoomCountAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await dbContext
            .Set<PlayerToken>()
            .AsNoTracking()
            .Where(pt => pt.UserId == userId)
            .Join(dbContext.Rooms.AsNoTracking(), pt => pt.RoomId, r => r.Id.Value, (pt, r) => r)
            .Where(r => r.Status == RoomStatus.Completed)
            .CountAsync(cancellationToken);
    }

    public async Task<QuickStatsRecord> GetQuickStatsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var userTokens = await dbContext
            .Set<PlayerToken>()
            .AsNoTracking()
            .Where(pt => pt.UserId == userId)
            .ToListAsync(cancellationToken);

        var roomIds = userTokens.Select(pt => pt.RoomId).Distinct().ToList();

        var completedRooms = await dbContext
            .Rooms.AsNoTracking()
            .Where(r => roomIds.Contains(r.Id.Value) && r.Status == RoomStatus.Completed)
            .Select(r => new { Id = r.Id.Value, r.Leaderboard })
            .ToListAsync(cancellationToken);

        var gamesPlayed = completedRooms.Count;

        var tokenLookup = userTokens.ToDictionary(pt => pt.RoomId, pt => pt.PlayerId);

        var wins = completedRooms.Count(r =>
            tokenLookup.TryGetValue(r.Id, out var playerId)
            && r.Leaderboard.Any(e => e.PlayerId == PlayerId.From(playerId))
        );

        return new QuickStatsRecord(gamesPlayed, wins);
    }

    public async Task<UserStatsRecord> GetStatsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var userTokens = await dbContext
            .Set<PlayerToken>()
            .AsNoTracking()
            .Where(pt => pt.UserId == userId)
            .ToListAsync(cancellationToken);

        var roomIds = userTokens.Select(pt => pt.RoomId).Distinct().ToList();

        var completedRooms = await dbContext
            .Rooms.AsNoTracking()
            .Where(r => roomIds.Contains(r.Id.Value) && r.Status == RoomStatus.Completed)
            .ToListAsync(cancellationToken);

        var gamesPlayed = completedRooms.Count;

        var tokenLookup = userTokens.ToDictionary(pt => pt.RoomId, pt => pt.PlayerId);

        var leaderboardEntries = completedRooms
            .SelectMany(r =>
            {
                if (!tokenLookup.TryGetValue(r.Id.Value, out var playerId))
                {
                    return [];
                }

                return r.Leaderboard.Where(e => e.PlayerId == PlayerId.From(playerId));
            })
            .ToList();

        var wins = leaderboardEntries.Count;
        var rowWins = leaderboardEntries.Count(e => e.WinningPattern == WinPatternType.Row);
        var columnWins = leaderboardEntries.Count(e => e.WinningPattern == WinPatternType.Column);
        var diagonalWins = leaderboardEntries.Count(e => e.WinningPattern == WinPatternType.Diagonal);
        var blackoutWins = leaderboardEntries.Count(e => e.WinningPattern == WinPatternType.Blackout);

        var rankCounts = leaderboardEntries.GroupBy(e => e.Rank).ToDictionary(g => g.Key, g => g.Count());

        return new UserStatsRecord(gamesPlayed, wins, rowWins, columnWins, diagonalWins, blackoutWins, rankCounts);
    }
}
