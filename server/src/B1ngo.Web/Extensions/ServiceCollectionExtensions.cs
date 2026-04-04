using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using Asp.Versioning;
using B1ngo.Application.Common;
using B1ngo.Application.Common.Ports;
using B1ngo.Application.Features;
using B1ngo.Domain.Core;
using B1ngo.Domain.Game.Events;
using B1ngo.Infrastructure;
using B1ngo.Infrastructure.Identity;
using B1ngo.Infrastructure.Persistence;
using B1ngo.Web.Constants;
using B1ngo.Web.EventHandlers;
using B1ngo.Web.Filters;
using B1ngo.Web.OpenApi;
using B1ngo.Web.Services;
using B1ngo.Web.Validators;
using FluentValidation;
using Microsoft.AspNetCore.Identity;

namespace B1ngo.Web.Extensions;

internal static class ServiceCollectionExtensions
{
    extension(IServiceCollection services)
    {
        // todo: clean this up
        public IServiceCollection AddWebServices(IConfiguration configuration, IHostEnvironment environment)
        {
            services.AddApplication().AddInfrastructure(configuration, environment);
            services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();

            services.AddHttpContextAccessor();
            services.AddScoped<CorrelationContext>();
            services.AddScoped<ICurrentUserProvider, CurrentUserProvider>();
            services.AddScoped<ICurrentUserContext, CurrentUserContext>();

            services.Configure<RouteOptions>(options => options.LowercaseUrls = true);
            services
                .AddControllers(options =>
                {
                    options.Filters.Add<ValidationFilter>();
                    options.Filters.Add<PlayerTokenAuthFilter>();
                    options.Filters.Add<XhrFilter>();
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

            services
                .AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
                {
                    options.Password.RequireDigit = PasswordRequirements.RequireDigit;
                    options.Password.RequiredLength = PasswordRequirements.MinimumLength;
                    options.Password.RequireUppercase = false;
                    options.Password.RequireLowercase = false;
                    options.Password.RequireNonAlphanumeric = false;
                    options.User.RequireUniqueEmail = true;

                    options.Lockout.MaxFailedAccessAttempts = 5;
                    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
                    options.Lockout.AllowedForNewUsers = true;
                })
                .AddEntityFrameworkStores<B1ngoDbContext>()
                .AddDefaultTokenProviders();

            services.Configure<DataProtectionTokenProviderOptions>(options =>
            {
                options.TokenLifespan = TimeSpan.FromHours(1);
            });

            services.AddExternalAuthProviders(configuration);

            services.ConfigureApplicationCookie(options =>
            {
                options.Cookie.HttpOnly = true;
                options.Cookie.SecurePolicy =
                    environment.IsDevelopment() || environment.IsEnvironment("Testing")
                        ? CookieSecurePolicy.SameAsRequest
                        : CookieSecurePolicy.Always;
                options.Cookie.SameSite = SameSiteMode.Lax;
                options.Cookie.Name = "B1ngo.Auth";
                options.ExpireTimeSpan = TimeSpan.FromDays(30);
                options.SlidingExpiration = true;
                options.Events.OnRedirectToLogin = ctx =>
                {
                    ctx.Response.StatusCode = 401;
                    return Task.CompletedTask;
                };
                options.Events.OnRedirectToAccessDenied = ctx =>
                {
                    ctx.Response.StatusCode = 403;
                    return Task.CompletedTask;
                };
            });

            services.AddHealthChecks().AddDbContextCheck<B1ngoDbContext>();

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

        private void AddExternalAuthProviders(IConfiguration configuration)
        {
            var auth = services.AddAuthentication();

            if (configuration["Auth:Google:ClientId"] is { Length: > 0 })
            {
                auth.AddGoogle(options =>
                {
                    options.ClientId = configuration["Auth:Google:ClientId"]!;
                    options.ClientSecret = configuration["Auth:Google:ClientSecret"]!;
                });
            }

            if (configuration["Auth:Microsoft:ClientId"] is { Length: > 0 })
            {
                auth.AddMicrosoftAccount(options =>
                {
                    options.ClientId = configuration["Auth:Microsoft:ClientId"]!;
                    options.ClientSecret = configuration["Auth:Microsoft:ClientSecret"]!;
                });
            }
        }

        private void AddRateLimiterPolicies()
        {
            services.AddRateLimiter(options =>
            {
                options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

                options.AddPolicy(
                    "auth",
                    context =>
                        RateLimitPartition.GetFixedWindowLimiter(
                            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                            _ => new FixedWindowRateLimiterOptions
                            {
                                PermitLimit = 10,
                                Window = TimeSpan.FromMinutes(1),
                                QueueLimit = 0,
                            }
                        )
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
