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
        var lookupName = sessionType switch
        {
            SessionType.FP2 or SessionType.FP3 => SessionType.FP1.ToString(),
            _ => sessionType.ToString(),
        };

        return await dbContext
            .EventPoolEntries.Where(e => e.SessionType.Name == lookupName)
            .Select(e => new EventPoolEntry(e.EventKey, e.DisplayText))
            .ToListAsync(cancellationToken);
    }
}
