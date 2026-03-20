using B1ngo.Domain.Game;

namespace B1ngo.Application.Common;

public interface IEventPoolRepository
{
    Task<IReadOnlyList<EventPoolEntry>> GetEventsAsync(
        SessionType sessionType,
        CancellationToken cancellationToken = default
    );
}
