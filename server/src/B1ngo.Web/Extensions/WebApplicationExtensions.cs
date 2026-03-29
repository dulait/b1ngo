using B1ngo.Infrastructure.Persistence;
using B1ngo.Web.Hubs;
using B1ngo.Web.Middleware;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

namespace B1ngo.Web.Extensions;

internal static class WebApplicationExtensions
{
    extension(WebApplication app)
    {
        public async Task<WebApplication> ConfigurePipeline()
        {
            app.UseForwardedHeaders(
                new ForwardedHeadersOptions
                {
                    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto,
                }
            );

            app.UseMiddleware<CorrelationIdMiddleware>();
            app.UseMiddleware<ExceptionHandlingMiddleware>();

            if (!app.Environment.IsDevelopment())
            {
                app.UseHttpsRedirection();
            }

            app.UseCors();

            app.UseAuthentication();
            app.UseAuthorization();

            if (!app.Environment.IsEnvironment("Testing"))
            {
                app.UseRateLimiter();
            }

            if (!app.Environment.IsProduction())
            {
                app.MapOpenApi();
                app.MapScalarApiReference(options =>
                {
                    options
                        .WithTitle("B1ngo API")
                        .WithTheme(ScalarTheme.Moon)
                        .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient);
                });
            }

            if (app.Environment.IsDevelopment() || app.Environment.IsEnvironment("Testing"))
            {
                await app.ApplyMigrationsAsync();
            }

            if (app.Environment.IsEnvironment("Testing"))
            {
                await app.SeedTestReferenceDataAsync();
            }

            app.MapControllers();
            app.MapHub<GameHub>("/hubs/game");
            app.MapHealthChecks("/health");

            return app;
        }

        private async Task ApplyMigrationsAsync()
        {
            using var scope = app.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<B1ngoDbContext>();

            if (db.Database.ProviderName?.Contains("Sqlite") == true)
            {
                return;
            }

            await db.Database.MigrateAsync();
        }

        private async Task SeedTestReferenceDataAsync()
        {
            using var scope = app.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<B1ngoDbContext>();
            await TestDataSeeder.SeedTestReferenceDataAsync(db);
        }
    }
}
