using Asp.Versioning;
using B1ngo.Application.Common;
using B1ngo.Application.Features;
using B1ngo.Domain.Core;
using B1ngo.Domain.Game.Events;
using B1ngo.Infrastructure;
using B1ngo.Web.EventHandlers;
using B1ngo.Web.Filters;
using B1ngo.Web.Services;

namespace B1ngo.Web.Extensions;

internal static class ServiceCollectionExtensions
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddWebServices(IConfiguration configuration)
        {
            services.AddApplication().AddInfrastructure(configuration);

            services.AddHttpContextAccessor();
            services.AddScoped<ICurrentUserProvider, CurrentUserProvider>();

            services.Configure<RouteOptions>(options => options.LowercaseUrls = true);
            services.AddControllers(options =>
            {
                options.Filters.Add<ValidationFilter>();
                options.Filters.Add<PlayerTokenAuthFilter>();
            });
            services.AddSignalR();
            services.AddDomainEventHandlers();
            services.AddApiVersioningDefaults();
            services.AddOpenApi(options =>
            {
                options.AddDocumentTransformer(
                    (document, _, _) =>
                    {
                        document.Info.Title = "B1ngo API";
                        document.Info.Version = "v1";
                        document.Info.Description =
                            "F1 Bingo game API — room management, gameplay, and real-time events.";
                        return Task.CompletedTask;
                    }
                );
            });

            return services;
        }

        private void AddDomainEventHandlers()
        {
            services.AddScoped<IDomainEventHandler<PlayerJoinedRoomDomainEvent>, PlayerJoinedEventHandler>();
            services.AddScoped<IDomainEventHandler<GameStartedDomainEvent>, GameStartedEventHandler>();
            services.AddScoped<IDomainEventHandler<SquareMarkedDomainEvent>, SquareMarkedEventHandler>();
            services.AddScoped<IDomainEventHandler<SquareUnmarkedDomainEvent>, SquareUnmarkedEventHandler>();
            services.AddScoped<IDomainEventHandler<BingoAchievedDomainEvent>, BingoAchievedEventHandler>();
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
