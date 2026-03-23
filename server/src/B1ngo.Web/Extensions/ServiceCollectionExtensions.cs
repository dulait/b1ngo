using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using Asp.Versioning;
using B1ngo.Application.Common;
using B1ngo.Application.Common.Ports;
using B1ngo.Application.Features;
using B1ngo.Domain.Core;
using B1ngo.Domain.Game.Events;
using B1ngo.Infrastructure;
using B1ngo.Web.EventHandlers;
using B1ngo.Web.Filters;
using B1ngo.Web.OpenApi;
using B1ngo.Web.Services;
using Microsoft.AspNetCore.RateLimiting;

namespace B1ngo.Web.Extensions;

internal static class ServiceCollectionExtensions
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddWebServices(IConfiguration configuration, IHostEnvironment environment)
        {
            services.AddApplication().AddInfrastructure(configuration);

            services.AddHttpContextAccessor();
            services.AddScoped<CorrelationContext>();
            services.AddScoped<ICurrentUserProvider, CurrentUserProvider>();

            services.Configure<RouteOptions>(options => options.LowercaseUrls = true);
            services
                .AddControllers(options =>
                {
                    options.Filters.Add<ValidationFilter>();
                    options.Filters.Add<PlayerTokenAuthFilter>();
                })
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                });
            services.AddSignalR();
            services.AddDomainEventHandlers();
            services.AddApiVersioningDefaults();
            services.AddOpenApi(options =>
            {
                options.AddDocumentTransformer<DocumentTransformer>();
                options.AddOperationTransformer<OperationTransformer>();
                options.AddSchemaTransformer<SchemaTransformer>();
            });
            services.AddCorsPolicy(configuration, environment);

            if (environment.IsProduction() || environment.IsEnvironment("Staging"))
            {
                services.AddRateLimiterPolicies();
            }

            services.AddHealthChecks();

            return services;
        }

        private void AddCorsPolicy(IConfiguration configuration, IHostEnvironment environment)
        {
            var allowedOrigins = configuration
                .GetValue<string>("AllowedOrigins")
                ?.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

            if (allowedOrigins is not { Length: > 0 })
            {
                if (!environment.IsDevelopment() && !environment.IsStaging() && !environment.IsEnvironment("Testing"))
                {
                    throw new InvalidOperationException(
                        "AllowedOrigins must be configured in production environments."
                    );
                }
            }

            services.AddCors(options =>
            {
                options.AddDefaultPolicy(policy =>
                {
                    if (allowedOrigins is { Length: > 0 })
                    {
                        policy.WithOrigins(allowedOrigins);
                    }

                    policy.AllowAnyHeader().AllowAnyMethod().AllowCredentials();
                });
            });
        }

        private void AddRateLimiterPolicies()
        {
            services.AddRateLimiter(options =>
            {
                options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

                options.AddFixedWindowLimiter(
                    "auth",
                    limiter =>
                    {
                        limiter.PermitLimit = 10;
                        limiter.Window = TimeSpan.FromMinutes(1);
                        limiter.QueueLimit = 0;
                    }
                );

                options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                        _ => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = 60,
                            Window = TimeSpan.FromMinutes(1),
                            QueueLimit = 0,
                        }
                    )
                );
            });
        }

        private void AddDomainEventHandlers()
        {
            services.AddScoped<IDomainEventHandler<PlayerJoinedRoomDomainEvent>, PlayerJoinedEventHandler>();
            services.AddScoped<IDomainEventHandler<GameStartedDomainEvent>, GameStartedEventHandler>();
            services.AddScoped<IDomainEventHandler<SquareMarkedDomainEvent>, SquareMarkedEventHandler>();
            services.AddScoped<IDomainEventHandler<SquareUnmarkedDomainEvent>, SquareUnmarkedEventHandler>();
            services.AddScoped<IDomainEventHandler<BingoAchievedDomainEvent>, BingoAchievedEventHandler>();
            services.AddScoped<IDomainEventHandler<BingoRevokedDomainEvent>, BingoRevokedEventHandler>();
            services.AddScoped<IDomainEventHandler<GameCompletedDomainEvent>, GameCompletedEventHandler>();
        }

        private void AddApiVersioningDefaults()
        {
            services
                .AddApiVersioning(options =>
                {
                    options.DefaultApiVersion = new ApiVersion(1);
                    options.AssumeDefaultVersionWhenUnspecified = true;
                    options.ReportApiVersions = true;
                    options.ApiVersionReader = new UrlSegmentApiVersionReader();
                })
                .AddApiExplorer(options =>
                {
                    options.GroupNameFormat = "'v'VVV";
                    options.SubstituteApiVersionInUrl = true;
                });
        }
    }
}
