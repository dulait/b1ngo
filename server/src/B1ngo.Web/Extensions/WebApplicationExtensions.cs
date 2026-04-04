using System.Text.Json;
using B1ngo.Infrastructure.Persistence;
using B1ngo.Web.Hubs;
using B1ngo.Web.Middleware;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Scalar.AspNetCore;

namespace B1ngo.Web.Extensions;

internal static class WebApplicationExtensions
{
    extension(WebApplication app)
    {
        public async Task<WebApplication> ConfigurePipeline()
        {
            var forwardedHeadersOptions = new ForwardedHeadersOptions
            {
                ForwardedHeaders =
                    ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedHost,
            };
            forwardedHeadersOptions.KnownIPNetworks.Clear();
            forwardedHeadersOptions.KnownProxies.Clear();
            app.UseForwardedHeaders(forwardedHeadersOptions);

            var publicOrigin = app.Configuration["Auth:PublicOrigin"];
            if (!string.IsNullOrEmpty(publicOrigin))
            {
                var uri = new Uri(publicOrigin);
                var hostString = uri.IsDefaultPort ? new HostString(uri.Host) : new HostString(uri.Host, uri.Port);

                app.Use(
                    (context, next) =>
                    {
                        context.Request.Scheme = uri.Scheme;
                        context.Request.Host = hostString;
                        return next();
                    }
                );
            }

            app.UseMiddleware<CorrelationIdMiddleware>();
            app.UseMiddleware<ExceptionHandlingMiddleware>();

            if (!app.Environment.IsDevelopment())
            {
                app.UseHttpsRedirection();
            }

            app.UseCors();

            app.UseAuthentication();
            app.UseAuthorization();

            if (app.Environment.IsProduction() || app.Environment.IsEnvironment("Staging"))
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
            app.MapHealthChecks("/health", new HealthCheckOptions { ResponseWriter = WriteHealthCheckResponse });

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

    private static async Task WriteHealthCheckResponse(HttpContext context, HealthReport report)
    {
        context.Response.ContentType = "application/json";

        var checks = report.Entries.ToDictionary(
            entry => entry.Key,
            entry =>
            {
                var result = new Dictionary<string, object>
                {
                    ["status"] = entry.Value.Status.ToString(),
                    ["duration"] = entry.Value.Duration.ToString(),
                };

                if (entry.Value.Description is not null)
                {
                    result["description"] = entry.Value.Description;
                }

                if (entry.Value.Status != HealthStatus.Healthy && entry.Value.Exception is not null)
                {
                    result["description"] = entry.Value.Exception.Message;
                }

                return result;
            }
        );

        var response = new { status = report.Status.ToString(), checks };

        await context.Response.WriteAsJsonAsync(
            response,
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }
        );
    }
}
