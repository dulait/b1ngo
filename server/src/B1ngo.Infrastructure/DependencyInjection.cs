using B1ngo.Application.Common.Ports;
using B1ngo.Domain.Core;
using B1ngo.Domain.Game;
using B1ngo.Infrastructure.Auth;
using B1ngo.Infrastructure.CardGeneration;
using B1ngo.Infrastructure.Email;
using B1ngo.Infrastructure.Persistence;
using B1ngo.Infrastructure.ReferenceData;
using B1ngo.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Resend;

namespace B1ngo.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration,
        IHostEnvironment environment
    )
    {
        services.AddDbContext<B1ngoDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("Database"),
                npgsqlOptions => npgsqlOptions.EnableRetryOnFailure(maxRetryCount: 3)
            )
        );

        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IDomainEventDispatcher, DomainEventDispatcher>();
        services.AddScoped<IRoomRepository, RoomRepository>();
        services.AddScoped<IPlayerTokenStore, PlayerTokenStore>();
        services.AddScoped<IEventPoolRepository, EventPoolRepository>();
        services.AddScoped<IReferenceDataRepository, ReferenceDataRepository>();
        services.AddScoped<IBingoCardGenerator, BingoCardGenerator>();
        services.AddScoped<IUserActivityRepository, UserActivityRepository>();

        if (environment.IsDevelopment() || environment.IsEnvironment("Testing"))
        {
            services.AddScoped<IEmailSender, LogEmailSender>();
        }
        else
        {
            services.AddSingleton<IResend>(_ =>
                ResendClient.Create(new ResendClientOptions { ApiToken = configuration["Email:Resend:ApiKey"]! })
            );
            services.AddScoped<IEmailSender, ResendEmailSender>();
        }

        services.AddHostedService<DataCleanupService>();

        return services;
    }
}
