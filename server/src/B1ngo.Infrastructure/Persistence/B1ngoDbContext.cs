using System.Text.Json;
using B1ngo.Application.Common;
using B1ngo.Domain.Core;
using B1ngo.Domain.Game;
using B1ngo.Infrastructure.Extensions;
using B1ngo.Infrastructure.Outbox;
using Microsoft.EntityFrameworkCore;

namespace B1ngo.Infrastructure.Persistence;

public sealed class B1ngoDbContext(
    DbContextOptions<B1ngoDbContext> options,
    ICurrentUserProvider currentUserProvider) : DbContext(options)
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(GetType().Assembly);
        modelBuilder.ApplyGlobalConventions();
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        SetAuditFields();
        ConvertDomainEventsToOutboxMessages();

        return await base.SaveChangesAsync(cancellationToken);
    }

    private void ConvertDomainEventsToOutboxMessages()
    {
        var utcNow = DateTimeOffset.UtcNow;

        var domainEvents = ChangeTracker
            .Entries<IHasDomainEvents>()
            .SelectMany(entry =>
            {
                var events = entry.Entity.DomainEvents.ToList();
                entry.Entity.ClearDomainEvents();
                return events;
            })
            .ToList();

        foreach (var domainEvent in domainEvents)
        {
            var eventType = domainEvent.GetType().AssemblyQualifiedName!;
            var payload = JsonSerializer.Serialize(domainEvent, domainEvent.GetType(), JsonOptions);

            var outboxMessage = OutboxMessage.Create(eventType, payload, utcNow);
            OutboxMessages.Add(outboxMessage);
        }
    }

    private void SetAuditFields()
    {
        var utcNow = DateTimeOffset.UtcNow;
        var userId = currentUserProvider.GetCurrentUserId();

        foreach (var entry in ChangeTracker.Entries<IAuditable>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = utcNow;
                entry.Entity.CreatedBy = userId;
                entry.Entity.LastModifiedAt = utcNow;
                entry.Entity.LastModifiedBy = userId;
            }

            if (entry.State == EntityState.Modified)
            {
                entry.Entity.LastModifiedAt = utcNow;
                entry.Entity.LastModifiedBy = userId;
            }
        }
    }
}
