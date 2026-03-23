using B1ngo.Domain.Core;
using Microsoft.Extensions.Logging;

namespace B1ngo.Infrastructure;

public sealed class DomainEventDispatcher(IServiceProvider serviceProvider, ILogger<DomainEventDispatcher> logger)
    : IDomainEventDispatcher
{
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
                try
                {
                    var method = handlerType.GetMethod("HandleAsync");
                    await (Task)method!.Invoke(handler, [domainEvent, cancellationToken])!;
                }
                catch (Exception ex)
                {
                    logger.LogError(
                        ex,
                        "Failed to handle {EventType} in {HandlerType}",
                        domainEvent.GetType().Name,
                        handler.GetType().Name
                    );
                }
            }
        }
    }
}
