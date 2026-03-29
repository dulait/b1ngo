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
        var tokenData = await dbContext
            .Set<PlayerToken>()
            .AsNoTracking()
            .Where(pt => pt.UserId == userId)
            .Select(pt => new
            {
                pt.RoomId,
                pt.PlayerId,
                pt.IsHost,
                pt.CreatedAt,
            })
            .ToListAsync(cancellationToken);

        if (tokenData.Count == 0)
        {
            return [];
        }

        var roomIds = tokenData.Select(t => RoomId.From(t.RoomId)).ToList();

        var roomData = await dbContext
            .Rooms.AsNoTracking()
            .Where(r => roomIds.Contains(r.Id) && (r.Status == RoomStatus.Lobby || r.Status == RoomStatus.Active))
            .Select(r => new
            {
                Id = r.Id.Value,
                GpName = r.Session.GrandPrixName,
                SessionType = r.Session.SessionType,
                PlayerCount = r.Players.Count,
                Status = r.Status,
            })
            .ToListAsync(cancellationToken);

        var roomLookup = roomData.ToDictionary(r => r.Id);

        var results = tokenData
            .Where(t => roomLookup.ContainsKey(t.RoomId))
            .OrderByDescending(t => t.CreatedAt)
            .Select(t =>
            {
                var r = roomLookup[t.RoomId];
                return new UserActiveRoomRecord(
                    t.RoomId,
                    t.PlayerId,
                    r.GpName,
                    r.SessionType.ToString(),
                    r.PlayerCount,
                    r.Status.ToString(),
                    t.IsHost,
                    t.CreatedAt
                );
            });

        return (limit.HasValue ? results.Take(limit.Value) : results).ToList();
    }

    public async Task<int> GetActiveRoomCountAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var roomIds = await dbContext
            .Set<PlayerToken>()
            .AsNoTracking()
            .Where(pt => pt.UserId == userId)
            .Select(pt => RoomId.From(pt.RoomId))
            .ToListAsync(cancellationToken);

        if (roomIds.Count == 0)
        {
            return 0;
        }

        return await dbContext
            .Rooms.AsNoTracking()
            .CountAsync(
                r => roomIds.Contains(r.Id) && (r.Status == RoomStatus.Lobby || r.Status == RoomStatus.Active),
                cancellationToken
            );
    }

    public async Task<List<UserCompletedRoomRecord>> GetCompletedRoomsPageAsync(
        Guid userId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default
    )
    {
        var tokenData = await dbContext
            .Set<PlayerToken>()
            .AsNoTracking()
            .Where(pt => pt.UserId == userId)
            .Select(pt => new { pt.RoomId, pt.PlayerId })
            .ToListAsync(cancellationToken);

        if (tokenData.Count == 0)
        {
            return [];
        }

        var roomIds = tokenData.Select(t => RoomId.From(t.RoomId)).ToList();
        var tokenLookup = tokenData.ToDictionary(t => t.RoomId, t => t.PlayerId);

        var roomData = await dbContext
            .Rooms.AsNoTracking()
            .Where(r => roomIds.Contains(r.Id) && r.Status == RoomStatus.Completed)
            .OrderByDescending(r => r.LastModifiedAt ?? r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new
            {
                Id = r.Id.Value,
                GpName = r.Session.GrandPrixName,
                SessionType = r.Session.SessionType,
                PlayerCount = r.Players.Count,
                r.LastModifiedAt,
                r.CreatedAt,
                r.Leaderboard,
            })
            .ToListAsync(cancellationToken);

        return roomData
            .Select(r =>
            {
                var playerId = tokenLookup[r.Id];
                var entry = r.Leaderboard.FirstOrDefault(e => e.PlayerId == PlayerId.From(playerId));

                return new UserCompletedRoomRecord(
                    r.Id,
                    r.GpName,
                    r.SessionType.ToString(),
                    r.PlayerCount,
                    r.LastModifiedAt ?? r.CreatedAt,
                    entry?.Rank,
                    entry?.WinningPattern.ToString()
                );
            })
            .ToList();
    }

    public async Task<int> GetCompletedRoomCountAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var roomIds = await dbContext
            .Set<PlayerToken>()
            .AsNoTracking()
            .Where(pt => pt.UserId == userId)
            .Select(pt => RoomId.From(pt.RoomId))
            .ToListAsync(cancellationToken);

        if (roomIds.Count == 0)
        {
            return 0;
        }

        return await dbContext
            .Rooms.AsNoTracking()
            .CountAsync(r => roomIds.Contains(r.Id) && r.Status == RoomStatus.Completed, cancellationToken);
    }

    public async Task<QuickStatsRecord> GetQuickStatsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var tokenData = await dbContext
            .Set<PlayerToken>()
            .AsNoTracking()
            .Where(pt => pt.UserId == userId)
            .Select(pt => new { pt.RoomId, pt.PlayerId })
            .ToListAsync(cancellationToken);

        if (tokenData.Count == 0)
        {
            return new QuickStatsRecord(0, 0);
        }

        var roomIds = tokenData.Select(t => RoomId.From(t.RoomId)).ToList();
        var tokenLookup = tokenData.ToDictionary(t => t.RoomId, t => t.PlayerId);

        var completedRooms = await dbContext
            .Rooms.AsNoTracking()
            .Where(r => roomIds.Contains(r.Id) && r.Status == RoomStatus.Completed)
            .Select(r => new { Id = r.Id.Value, r.Leaderboard })
            .ToListAsync(cancellationToken);

        var gamesPlayed = completedRooms.Count;
        var wins = completedRooms.Count(r =>
        {
            var playerId = tokenLookup[r.Id];
            return r.Leaderboard.Any(e => e.PlayerId == PlayerId.From(playerId));
        });

        return new QuickStatsRecord(gamesPlayed, wins);
    }

    public async Task<UserStatsRecord> GetStatsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var tokenData = await dbContext
            .Set<PlayerToken>()
            .AsNoTracking()
            .Where(pt => pt.UserId == userId)
            .Select(pt => new { pt.RoomId, pt.PlayerId })
            .ToListAsync(cancellationToken);

        if (tokenData.Count == 0)
        {
            return new UserStatsRecord(0, 0, 0, 0, 0, 0, new Dictionary<int, int>());
        }

        var roomIds = tokenData.Select(t => RoomId.From(t.RoomId)).ToList();
        var tokenLookup = tokenData.ToDictionary(t => t.RoomId, t => t.PlayerId);

        var completedRooms = await dbContext
            .Rooms.AsNoTracking()
            .Where(r => roomIds.Contains(r.Id) && r.Status == RoomStatus.Completed)
            .Select(r => new { Id = r.Id.Value, r.Leaderboard })
            .ToListAsync(cancellationToken);

        var gamesPlayed = completedRooms.Count;

        var leaderboardEntries = completedRooms
            .SelectMany(r =>
            {
                var playerId = tokenLookup[r.Id];
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
