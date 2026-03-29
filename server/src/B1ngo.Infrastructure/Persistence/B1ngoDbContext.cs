using B1ngo.Application.Common;
using B1ngo.Application.Common.Ports;
using B1ngo.Domain.Core;
using B1ngo.Domain.Game;
using B1ngo.Infrastructure.Extensions;
using B1ngo.Infrastructure.Identity;
using B1ngo.Infrastructure.ReferenceData;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace B1ngo.Infrastructure.Persistence;

public sealed class B1ngoDbContext(
    DbContextOptions<B1ngoDbContext> options,
    ICurrentUserProvider currentUserProvider,
    IServiceProvider serviceProvider
) : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>(options)
{
    public DbSet<Room> Rooms => Set<Room>();
    internal DbSet<GrandPrixEntity> GrandPrix => Set<GrandPrixEntity>();
    internal DbSet<EventPoolEntryEntity> EventPoolEntries => Set<EventPoolEntryEntity>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.ApplyConfigurationsFromAssembly(GetType().Assembly);
        builder.ApplyGlobalConventions();

        builder.Entity<ApplicationUser>(b => b.ToTable("users", "identity"));
        builder.Entity<IdentityRole<Guid>>(b => b.ToTable("roles", "identity"));
        builder.Entity<IdentityUserRole<Guid>>(b => b.ToTable("user_roles", "identity"));
        builder.Entity<IdentityUserLogin<Guid>>(b => b.ToTable("user_logins", "identity"));
        builder.Entity<IdentityUserToken<Guid>>(b => b.ToTable("user_tokens", "identity"));
        builder.Entity<IdentityUserClaim<Guid>>(b => b.ToTable("user_claims", "identity"));
        builder.Entity<IdentityRoleClaim<Guid>>(b => b.ToTable("role_claims", "identity"));

        builder.Entity<GrandPrixEntity>().ToTable("grand_prix");
        builder.Entity<EventPoolEntryEntity>().ToTable("event_pool_entries");
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        SetAuditFields();
        var domainEvents = CollectDomainEvents();

        var result = await base.SaveChangesAsync(cancellationToken);

        await DispatchCollectedEvents(domainEvents, cancellationToken);

        return result;
    }

    private List<IDomainEvent> CollectDomainEvents()
    {
        var correlationId = serviceProvider.GetService<CorrelationContext>()?.CorrelationId;

        var domainEvents = ChangeTracker
            .Entries<IHasDomainEvents>()
            .SelectMany(entry =>
            {
                var events = entry.Entity.DomainEvents.ToList();
                entry.Entity.ClearDomainEvents();
                return events;
            })
            .ToList();

        if (correlationId.HasValue)
        {
            foreach (var domainEvent in domainEvents)
            {
                domainEvent.CorrelationId = correlationId.Value;
            }
        }

        return domainEvents;
    }

    private async Task DispatchCollectedEvents(List<IDomainEvent> domainEvents, CancellationToken cancellationToken)
    {
        if (domainEvents.Count == 0)
        {
            return;
        }

        var logger = serviceProvider.GetService<ILogger<B1ngoDbContext>>();

        logger?.LogInformation(
            "Dispatching {Count} domain events: [{EventTypes}]",
            domainEvents.Count,
            string.Join(", ", domainEvents.Select(e => e.GetType().Name))
        );

        var dispatcher = serviceProvider.GetRequiredService<IDomainEventDispatcher>();
        await dispatcher.DispatchAsync(domainEvents, cancellationToken);

        logger?.LogInformation("Successfully dispatched {Count} domain events", domainEvents.Count);
    }

    private void SetAuditFields()
    {
        var utcNow = DateTimeOffset.UtcNow;
        var userId = currentUserProvider.GetCurrentUserId();

        foreach (var entry in ChangeTracker.Entries<IAuditable>())
        {
            entry.CurrentValues[nameof(IAuditable.LastModifiedAt)] = utcNow;
            entry.CurrentValues[nameof(IAuditable.LastModifiedBy)] = userId;

            if (entry.State == EntityState.Added)
            {
                entry.CurrentValues[nameof(IAuditable.CreatedAt)] = utcNow;
                entry.CurrentValues[nameof(IAuditable.CreatedBy)] = userId;
            }
        }
    }
}
