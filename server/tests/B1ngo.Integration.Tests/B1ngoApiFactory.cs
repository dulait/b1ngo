using B1ngo.Infrastructure.Persistence;
using B1ngo.Infrastructure.ReferenceData;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Testcontainers.PostgreSql;

namespace B1ngo.Integration.Tests;

public sealed class B1ngoApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder().WithImage("postgres:17-alpine").Build();

    private bool _seeded;

    public async Task InitializeAsync()
    {
        await _postgres.StartAsync();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.UseSetting("ConnectionStrings:Database", _postgres.GetConnectionString());
    }

    public HttpClient CreateAuthenticatedClient(Guid playerToken)
    {
        var client = CreateClient();
        client.DefaultRequestHeaders.Add("X-Player-Token", playerToken.ToString());
        return client;
    }

    public async Task EnsureTestReferenceDataAsync()
    {
        if (_seeded)
        {
            return;
        }

        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<B1ngoDbContext>();

        var hasData = db.GrandPrix.Any();
        if (!hasData)
        {
            db.GrandPrix.AddRange(
                new GrandPrixEntity
                {
                    Name = "Test Grand Prix",
                    Season = 2026,
                    Round = 1,
                    IsSprint = false,
                    SessionTypes = ["FP1", "FP2", "FP3", "Qualifying", "Race"],
                },
                new GrandPrixEntity
                {
                    Name = "Test Sprint Grand Prix",
                    Season = 2026,
                    Round = 2,
                    IsSprint = true,
                    SessionTypes = ["FP1", "SprintQualifying", "Sprint", "Qualifying", "Race"],
                }
            );
            await db.SaveChangesAsync();
        }

        _seeded = true;
    }

    public new async Task DisposeAsync()
    {
        await base.DisposeAsync();
        await _postgres.DisposeAsync();
    }
}
