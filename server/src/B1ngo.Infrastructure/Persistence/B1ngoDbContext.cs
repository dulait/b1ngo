using B1ngo.Application.Common.Ports;
using B1ngo.Domain.Core;
using B1ngo.Domain.Game;
using B1ngo.Infrastructure.Extensions;
using B1ngo.Infrastructure.ReferenceData;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace B1ngo.Infrastructure.Persistence;

public sealed class B1ngoDbContext(
    DbContextOptions<B1ngoDbContext> options,
    ICurrentUserProvider currentUserProvider,
    IServiceProvider serviceProvider
) : DbContext(options)
{
    public DbSet<Room> Rooms => Set<Room>();
    internal DbSet<GrandPrixEntity> GrandPrix => Set<GrandPrixEntity>();
    internal DbSet<EventPoolEntryEntity> EventPoolEntries => Set<EventPoolEntryEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(GetType().Assembly);
        modelBuilder.ApplyGlobalConventions();

        modelBuilder.Entity<GrandPrixEntity>().ToTable("grand_prix");
        modelBuilder.Entity<EventPoolEntryEntity>().ToTable("event_pool_entries");
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
        var domainEvents = ChangeTracker
            .Entries<IHasDomainEvents>()
            .SelectMany(entry =>
            {
                var events = entry.Entity.DomainEvents.ToList();
                entry.Entity.ClearDomainEvents();
                return events;
            })
            .ToList();

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
