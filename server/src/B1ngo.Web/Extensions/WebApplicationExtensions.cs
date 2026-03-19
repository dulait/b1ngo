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

            app.UseMiddleware<ExceptionHandlingMiddleware>();

            if (!app.Environment.IsDevelopment())
            {
                app.UseHttpsRedirection();
            }

            app.UseCors();
            app.UseRateLimiter();

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

            if (app.Environment.IsDevelopment())
            {
                await app.ApplyMigrationsAsync();
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
            await db.Database.MigrateAsync();
        }
    }
}
