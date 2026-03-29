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
        var tokens = dbContext.Set<PlayerToken>().AsNoTracking().Where(pt => pt.UserId == userId);

        var rooms = dbContext
            .Rooms.AsNoTracking()
            .Select(r => new
            {
                Id = r.Id.Value,
                r.Status,
                GpName = r.Session.GrandPrixName,
                SessionType = r.Session.SessionType,
                PlayerCount = r.Players.Count,
            });

        var query =
            from pt in tokens
            join r in rooms on pt.RoomId equals r.Id
            where r.Status == RoomStatus.Lobby || r.Status == RoomStatus.Active
            orderby pt.CreatedAt descending
            select new UserActiveRoomRecord(
                pt.RoomId,
                pt.PlayerId,
                r.GpName,
                r.SessionType.ToString(),
                r.PlayerCount,
                r.Status.ToString(),
                pt.IsHost,
                pt.CreatedAt
            );

        if (limit.HasValue)
        {
            query = query.Take(limit.Value);
        }

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<int> GetActiveRoomCountAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var tokens = dbContext.Set<PlayerToken>().AsNoTracking().Where(pt => pt.UserId == userId);
        var rooms = dbContext.Rooms.AsNoTracking().Select(r => new { Id = r.Id.Value, r.Status });

        return await (
            from pt in tokens
            join r in rooms on pt.RoomId equals r.Id
            where r.Status == RoomStatus.Lobby || r.Status == RoomStatus.Active
            select pt
        ).CountAsync(cancellationToken);
    }

    public async Task<List<UserCompletedRoomRecord>> GetCompletedRoomsPageAsync(
        Guid userId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default
    )
    {
        var tokens = dbContext.Set<PlayerToken>().AsNoTracking().Where(pt => pt.UserId == userId);

        var rooms = dbContext
            .Rooms.AsNoTracking()
            .Select(r => new
            {
                Id = r.Id.Value,
                r.Status,
                GpName = r.Session.GrandPrixName,
                SessionType = r.Session.SessionType,
                PlayerCount = r.Players.Count,
                r.LastModifiedAt,
                r.CreatedAt,
                r.Leaderboard,
            });

        var completedData = await (
            from pt in tokens
            join r in rooms on pt.RoomId equals r.Id
            where r.Status == RoomStatus.Completed
            orderby r.LastModifiedAt descending
            select new
            {
                pt.PlayerId,
                r.Id,
                r.GpName,
                r.SessionType,
                r.PlayerCount,
                r.LastModifiedAt,
                r.CreatedAt,
                r.Leaderboard,
            }
        )
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return completedData
            .Select(x =>
            {
                var entry = x.Leaderboard.FirstOrDefault(e => e.PlayerId == PlayerId.From(x.PlayerId));

                return new UserCompletedRoomRecord(
                    x.Id,
                    x.GpName,
                    x.SessionType.ToString(),
                    x.PlayerCount,
                    x.LastModifiedAt ?? x.CreatedAt,
                    entry?.Rank,
                    entry?.WinningPattern.ToString()
                );
            })
            .ToList();
    }

    public async Task<int> GetCompletedRoomCountAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var tokens = dbContext.Set<PlayerToken>().AsNoTracking().Where(pt => pt.UserId == userId);
        var rooms = dbContext.Rooms.AsNoTracking().Select(r => new { Id = r.Id.Value, r.Status });

        return await (
            from pt in tokens
            join r in rooms on pt.RoomId equals r.Id
            where r.Status == RoomStatus.Completed
            select pt
        ).CountAsync(cancellationToken);
    }

    public async Task<QuickStatsRecord> GetQuickStatsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var tokens = dbContext.Set<PlayerToken>().AsNoTracking().Where(pt => pt.UserId == userId);

        var rooms = dbContext
            .Rooms.AsNoTracking()
            .Select(r => new
            {
                Id = r.Id.Value,
                r.Status,
                r.Leaderboard,
            });

        var completedData = await (
            from pt in tokens
            join r in rooms on pt.RoomId equals r.Id
            where r.Status == RoomStatus.Completed
            select new { pt.PlayerId, r.Leaderboard }
        ).ToListAsync(cancellationToken);

        var gamesPlayed = completedData.Count;
        var wins = completedData.Count(x => x.Leaderboard.Any(e => e.PlayerId == PlayerId.From(x.PlayerId)));

        return new QuickStatsRecord(gamesPlayed, wins);
    }

    public async Task<UserStatsRecord> GetStatsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var tokens = dbContext.Set<PlayerToken>().AsNoTracking().Where(pt => pt.UserId == userId);

        var rooms = dbContext
            .Rooms.AsNoTracking()
            .Select(r => new
            {
                Id = r.Id.Value,
                r.Status,
                r.Leaderboard,
            });

        var completedData = await (
            from pt in tokens
            join r in rooms on pt.RoomId equals r.Id
            where r.Status == RoomStatus.Completed
            select new { pt.PlayerId, r.Leaderboard }
        ).ToListAsync(cancellationToken);

        var gamesPlayed = completedData.Count;

        var leaderboardEntries = completedData
            .SelectMany(x => x.Leaderboard.Where(e => e.PlayerId == PlayerId.From(x.PlayerId)))
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
