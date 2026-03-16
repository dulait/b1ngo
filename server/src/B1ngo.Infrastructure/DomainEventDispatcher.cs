using B1ngo.Domain.Core;

namespace B1ngo.Infrastructure;

public sealed class DomainEventDispatcher(IServiceProvider serviceProvider) : IDomainEventDispatcher
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
                var method = handlerType.GetMethod("HandleAsync");
                await (Task)method!.Invoke(handler, [domainEvent, cancellationToken])!;
            }
        }
    }
}
