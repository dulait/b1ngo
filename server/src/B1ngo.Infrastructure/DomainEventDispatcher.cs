using B1ngo.Domain.Core;
using Microsoft.Extensions.Logging;

namespace B1ngo.Infrastructure;

public sealed class DomainEventDispatcher(IServiceProvider serviceProvider, ILogger<DomainEventDispatcher> logger)
    : IDomainEventDispatcher
{
    private static readonly int[] RetryDelaysMs = [200, 1000, 3000];

    public async Task DispatchAsync(
        IEnumerable<IDomainEvent> domainEvents,
        CancellationToken cancellationToken = default
    )
    {
        foreach (var domainEvent in domainEvents)
        {
            var handlerType = typeof(IDomainEventHandler<>).MakeGenericType(domainEvent.GetType());
            var handlersEnumerableType = typeof(IEnumerable<>).MakeGenericType(handlerType);

            var handlers = serviceProvider.GetService(handlersEnumerableType);

            if (handlers is null)
            {
                continue;
            }

            foreach (var handler in (IEnumerable<object>)handlers)
            {
                await DispatchToHandlerWithRetryAsync(domainEvent, handler, handlerType, cancellationToken);
            }
        }
    }

    private async Task DispatchToHandlerWithRetryAsync(
        IDomainEvent domainEvent,
        object handler,
        Type handlerType,
        CancellationToken cancellationToken
    )
    {
        var method = handlerType.GetMethod("HandleAsync");
        var eventTypeName = domainEvent.GetType().Name;
        var handlerTypeName = handler.GetType().Name;

        for (var attempt = 0; attempt <= RetryDelaysMs.Length; attempt++)
        {
            try
            {
                await (Task)method!.Invoke(handler, [domainEvent, cancellationToken])!;
                return;
            }
            catch (Exception ex)
            {
                if (attempt < RetryDelaysMs.Length)
                {
                    logger.LogWarning(
                        ex,
                        "Handler {HandlerType} failed for {EventType}, attempt {Attempt} of {MaxAttempts}. Retrying in {DelayMs}ms",
                        handlerTypeName,
                        eventTypeName,
                        attempt + 1,
                        RetryDelaysMs.Length + 1,
                        RetryDelaysMs[attempt]
                    );

                    await Task.Delay(RetryDelaysMs[attempt], cancellationToken);
                }
                else
                {
                    logger.LogError(
                        ex,
                        "Handler {HandlerType} failed for {EventType} after {MaxAttempts} attempts. Giving up.",
                        handlerTypeName,
                        eventTypeName,
                        RetryDelaysMs.Length + 1
                    );
                }
            }
        }
    }
}
