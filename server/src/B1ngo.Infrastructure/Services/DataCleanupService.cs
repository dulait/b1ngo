using B1ngo.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace B1ngo.Infrastructure.Services;

public sealed class DataCleanupService(IServiceProvider serviceProvider, ILogger<DataCleanupService> logger)
    : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromHours(24));

        await RunCleanupAsync(stoppingToken);

        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            await RunCleanupAsync(stoppingToken);
        }
    }

    internal async Task RunCleanupAsync(CancellationToken ct)
    {
        try
        {
            using var scope = serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<B1ngoDbContext>();

            await using var transaction = await db.Database.BeginTransactionAsync(ct);

            var anonymousCompletedTokens = await db.Database.ExecuteSqlRawAsync(
                """
                DELETE FROM player_tokens
                WHERE user_id IS NULL
                  AND room_id IN (SELECT id FROM rooms WHERE status = 'Completed')
                """,
                ct
            );
            logger.LogInformation(
                "Cleanup: deleted {Count} anonymous tokens for completed rooms",
                anonymousCompletedTokens
            );

            var anonymousExpiredTokens = await db.Database.ExecuteSqlRawAsync(
                """
                DELETE FROM player_tokens
                WHERE user_id IS NULL
                  AND created_at < NOW() - INTERVAL '24 hours'
                  AND room_id IN (SELECT id FROM rooms WHERE status != 'Completed')
                """,
                ct
            );
            logger.LogInformation(
                "Cleanup: deleted {Count} anonymous tokens older than 24h for active rooms",
                anonymousExpiredTokens
            );

            var abandonedRooms = await db.Database.ExecuteSqlRawAsync(
                """
                DELETE FROM rooms
                WHERE status IN ('Lobby', 'Active')
                  AND last_modified_at < NOW() - INTERVAL '30 days'
                """,
                ct
            );
            logger.LogInformation("Cleanup: deleted {Count} abandoned rooms", abandonedRooms);

            var completedRooms = await db.Database.ExecuteSqlRawAsync(
                """
                DELETE FROM rooms
                WHERE status = 'Completed'
                  AND last_modified_at < NOW() - INTERVAL '30 days'
                  AND id NOT IN (
                      SELECT DISTINCT room_id FROM player_tokens WHERE user_id IS NOT NULL
                  )
                """,
                ct
            );
            logger.LogInformation("Cleanup: deleted {Count} completed rooms without registered users", completedRooms);

            await transaction.CommitAsync(ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Data cleanup failed");
        }
    }
}
