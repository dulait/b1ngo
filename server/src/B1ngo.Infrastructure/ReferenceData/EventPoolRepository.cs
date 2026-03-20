using B1ngo.Application.Common;
using B1ngo.Domain.Game;
using B1ngo.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace B1ngo.Infrastructure.ReferenceData;

internal sealed class EventPoolRepository(B1ngoDbContext dbContext) : IEventPoolRepository
{
    public async Task<IReadOnlyList<EventPoolEntry>> GetEventsAsync(
        SessionType sessionType,
        CancellationToken cancellationToken = default
    )
    {
        return await dbContext
            .EventPoolEntries.Where(e => e.SessionType == sessionType.ToString())
            .Select(e => new EventPoolEntry(e.EventKey, e.DisplayText))
            .ToListAsync(cancellationToken);
    }
}
