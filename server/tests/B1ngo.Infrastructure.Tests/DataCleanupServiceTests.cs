using B1ngo.Application.Common.Ports;
using B1ngo.Infrastructure.Persistence;
using B1ngo.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using Testcontainers.PostgreSql;

namespace B1ngo.Infrastructure.Tests;

[System.Diagnostics.CodeAnalysis.SuppressMessage(
    "Reliability",
    "CA1001:Types that own disposable fields should be disposable",
    Justification = "Disposed via IAsyncLifetime"
)]
public sealed class DataCleanupServiceTests : IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder("postgres:17-alpine").Build();

    private ServiceProvider _provider = null!;
    private DataCleanupService _sut = null!;

    public async Task InitializeAsync()
    {
        await _postgres.StartAsync();

        var services = new ServiceCollection();
        services.AddSingleton<ICurrentUserProvider, StubCurrentUserProvider>();
        services.AddDbContext<B1ngoDbContext>(options => options.UseNpgsql(_postgres.GetConnectionString()));
        _provider = services.BuildServiceProvider();

        using var scope = _provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<B1ngoDbContext>();
        await db.Database.MigrateAsync();

        _sut = new DataCleanupService(_provider, NullLogger<DataCleanupService>.Instance);
    }

    public async Task DisposeAsync()
    {
        await _provider.DisposeAsync();
        await _postgres.DisposeAsync();
    }

    [Fact]
    public async Task RunCleanupAsync_DeletesAnonymousTokensForCompletedRooms()
    {
        var roomId = await SeedRoom("Completed", DateTimeOffset.UtcNow);
        await SeedPlayerToken(roomId, userId: null, DateTimeOffset.UtcNow);

        await _sut.RunCleanupAsync(CancellationToken.None);

        Assert.Equal(0, await CountTokens(roomId));
    }

    [Fact]
    public async Task RunCleanupAsync_DeletesAnonymousTokensOlderThan24hForActiveRooms()
    {
        var roomId = await SeedRoom("Active", DateTimeOffset.UtcNow);
        await SeedPlayerToken(roomId, userId: null, DateTimeOffset.UtcNow.AddHours(-25));

        await _sut.RunCleanupAsync(CancellationToken.None);

        Assert.Equal(0, await CountTokens(roomId));
    }

    [Fact]
    public async Task RunCleanupAsync_PreservesRegisteredUserTokens()
    {
        var roomId = await SeedRoom("Completed", DateTimeOffset.UtcNow);
        var userId = Guid.NewGuid();
        await SeedPlayerToken(roomId, userId, DateTimeOffset.UtcNow);

        await _sut.RunCleanupAsync(CancellationToken.None);

        Assert.Equal(1, await CountTokens(roomId));
    }

    [Fact]
    public async Task RunCleanupAsync_DeletesAbandonedRooms()
    {
        var roomId = await SeedRoom("Lobby", DateTimeOffset.UtcNow.AddDays(-31));

        await _sut.RunCleanupAsync(CancellationToken.None);

        Assert.Equal(0, await CountRooms(roomId));
    }

    [Fact]
    public async Task RunCleanupAsync_PreservesCompletedRoomsWithRegisteredUsers()
    {
        var roomId = await SeedRoom("Completed", DateTimeOffset.UtcNow.AddDays(-31));
        await SeedPlayerToken(roomId, userId: Guid.NewGuid(), DateTimeOffset.UtcNow);

        await _sut.RunCleanupAsync(CancellationToken.None);

        Assert.Equal(1, await CountRooms(roomId));
    }

    [Fact]
    public async Task RunCleanupAsync_DeletesCompletedRoomsWithoutRegisteredUsers()
    {
        var roomId = await SeedRoom("Completed", DateTimeOffset.UtcNow.AddDays(-31));

        await _sut.RunCleanupAsync(CancellationToken.None);

        Assert.Equal(0, await CountRooms(roomId));
    }

    [Fact]
    public async Task RunCleanupAsync_HandlesDbExceptionsWithoutCrashing()
    {
        await _postgres.StopAsync();

        var ex = await Record.ExceptionAsync(() => _sut.RunCleanupAsync(CancellationToken.None));

        Assert.Null(ex);
    }

    private async Task<Guid> SeedRoom(string status, DateTimeOffset lastModifiedAt)
    {
        var roomId = Guid.NewGuid();
        var hostPlayerId = Guid.NewGuid();

        using var scope = _provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<B1ngoDbContext>();

        var joinCode = Guid.NewGuid().ToString()[..8];
        var config = @"{""MatrixSize"":5,""WinningPatterns"":[""Row""],""MaxPlayers"":20}";
        var leaderboard = "[]";

        await db.Database.ExecuteSqlAsync(
            $"""
            INSERT INTO rooms (id, join_code, status, host_player_id, season, grand_prix_name, session_type, "Configuration", "Leaderboard", created_at, last_modified_at, created_by)
            VALUES ({roomId}, {joinCode}, {status}, {hostPlayerId}, 2026, 'Test GP', 'Race', {config}::jsonb, {leaderboard}::jsonb, {lastModifiedAt}, {lastModifiedAt}, {hostPlayerId})
            """
        );

        return roomId;
    }

    private async Task SeedPlayerToken(Guid roomId, Guid? userId, DateTimeOffset createdAt)
    {
        using var scope = _provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<B1ngoDbContext>();

        var token = Guid.NewGuid();
        var playerId = Guid.NewGuid();

        if (userId.HasValue)
        {
            await db.Database.ExecuteSqlAsync(
                $"""
                INSERT INTO identity.users (id, user_name, normalized_user_name, email, normalized_email, email_confirmed, phone_number_confirmed, two_factor_enabled, lockout_enabled, access_failed_count, security_stamp, concurrency_stamp, display_name, created_at)
                VALUES ({userId.Value}, {$"user-{userId.Value}"}, {$"USER-{userId.Value}"}, {$"{userId.Value}@test.com"}, {$"{userId.Value}@TEST.COM"}, true, false, false, false, 0, {Guid.NewGuid().ToString()}, {Guid.NewGuid().ToString()}, 'Test', {createdAt})
                ON CONFLICT (id) DO NOTHING
                """
            );

            await db.Database.ExecuteSqlAsync(
                $"""
                INSERT INTO player_tokens (token, player_id, room_id, is_host, user_id, created_at)
                VALUES ({token}, {playerId}, {roomId}, false, {userId.Value}, {createdAt})
                """
            );
        }
        else
        {
            await db.Database.ExecuteSqlAsync(
                $"""
                INSERT INTO player_tokens (token, player_id, room_id, is_host, user_id, created_at)
                VALUES ({token}, {playerId}, {roomId}, false, NULL, {createdAt})
                """
            );
        }
    }

    private async Task<int> CountTokens(Guid roomId)
    {
        using var scope = _provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<B1ngoDbContext>();
        return await db
            .Database.SqlQuery<int>($"SELECT COUNT(*)::int AS \"Value\" FROM player_tokens WHERE room_id = {roomId}")
            .FirstAsync();
    }

    private async Task<int> CountRooms(Guid roomId)
    {
        using var scope = _provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<B1ngoDbContext>();
        return await db
            .Database.SqlQuery<int>($"SELECT COUNT(*)::int AS \"Value\" FROM rooms WHERE id = {roomId}")
            .FirstAsync();
    }

    private sealed class StubCurrentUserProvider : ICurrentUserProvider
    {
        public Guid GetCurrentUserId() => Guid.Empty;
    }
}
