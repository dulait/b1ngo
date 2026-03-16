using System.Text.Json;
using B1ngo.Domain.Core;
using B1ngo.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace B1ngo.Infrastructure.Outbox;

public sealed class OutboxProcessor(IServiceScopeFactory scopeFactory, ILogger<OutboxProcessor> logger)
    : BackgroundService
{
    private const int PollingIntervalSeconds = 5;
    private const int BatchSize = 20;
    private const int MaxRetryCount = 5;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessOutboxMessagesAsync(stoppingToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "Error processing outbox messages");
            }

            await Task.Delay(TimeSpan.FromSeconds(PollingIntervalSeconds), stoppingToken);
        }
    }

    private async Task ProcessOutboxMessagesAsync(CancellationToken cancellationToken)
    {
        using var scope = scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<B1ngoDbContext>();
        var dispatcher = scope.ServiceProvider.GetRequiredService<IDomainEventDispatcher>();

        var messages = await dbContext
            .OutboxMessages.Where(m => m.ProcessedAt == null && m.RetryCount < MaxRetryCount)
            .OrderBy(m => m.OccurredAt)
            .Take(BatchSize)
            .ToListAsync(cancellationToken);

        foreach (var message in messages)
        {
            try
            {
                var eventClrType = Type.GetType(message.EventType);
                if (eventClrType is null)
                {
                    logger.LogWarning(
                        "Cannot resolve type '{EventType}' for outbox message {MessageId}. Marking as poison.",
                        message.EventType,
                        message.Id
                    );
                    message.MarkFailed($"Cannot resolve type: {message.EventType}");
                    PoisonIfExhausted(message);
                    await dbContext.SaveChangesAsync(cancellationToken);
                    continue;
                }

                var domainEvent = JsonSerializer.Deserialize(message.Payload, eventClrType, JsonOptions);
                if (domainEvent is not IDomainEvent typedEvent)
                {
                    logger.LogWarning(
                        "Deserialized outbox message {MessageId} is not an IDomainEvent. Marking as poison.",
                        message.Id
                    );
                    message.MarkFailed("Deserialized object is not an IDomainEvent.");
                    PoisonIfExhausted(message);
                    await dbContext.SaveChangesAsync(cancellationToken);
                    continue;
                }

                await dispatcher.DispatchAsync([typedEvent], cancellationToken);

                message.MarkProcessed(DateTimeOffset.UtcNow);
                await dbContext.SaveChangesAsync(cancellationToken);

                logger.LogDebug("Processed outbox message {MessageId} ({EventType})", message.Id, message.EventType);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogWarning(
                    ex,
                    "Failed to process outbox message {MessageId} (attempt {RetryCount})",
                    message.Id,
                    message.RetryCount + 1
                );

                message.MarkFailed(ex.Message);
                PoisonIfExhausted(message);
                await dbContext.SaveChangesAsync(cancellationToken);
            }
        }
    }

    private void PoisonIfExhausted(OutboxMessage message)
    {
        if (message.RetryCount >= MaxRetryCount)
        {
            logger.LogError(
                "Outbox message {MessageId} has exceeded max retry count ({MaxRetryCount}). "
                    + "Message will not be retried. Last error: {Error}",
                message.Id,
                MaxRetryCount,
                message.Error
            );
        }
    }
}
