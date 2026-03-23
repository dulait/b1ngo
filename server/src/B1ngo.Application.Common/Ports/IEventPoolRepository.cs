using B1ngo.Domain.Game;

namespace B1ngo.Application.Common.Ports;

public interface IEventPoolRepository
{
    Task<IReadOnlyList<EventPoolEntry>> GetEventsAsync(
        SessionType sessionType,
        CancellationToken cancellationToken = default
    );
}

public sealed record EventPoolEntry(string EventKey, string DisplayText);
