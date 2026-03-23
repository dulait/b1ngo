using B1ngo.Infrastructure.Persistence;
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
        await TestDataSeeder.SeedTestReferenceDataAsync(db);

        _seeded = true;
    }

    public new async Task DisposeAsync()
    {
        await base.DisposeAsync();
        await _postgres.DisposeAsync();
    }
}
