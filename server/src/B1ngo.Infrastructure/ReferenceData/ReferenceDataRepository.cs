using B1ngo.Application.Common;
using B1ngo.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace B1ngo.Infrastructure.ReferenceData;

internal sealed class ReferenceDataRepository(B1ngoDbContext dbContext) : IReferenceDataRepository
{
    public async Task<IReadOnlyList<SessionTypeDto>> GetSessionTypesAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext
            .SessionTypes.OrderBy(s => s.SortOrder)
            .Select(s => new SessionTypeDto(s.Name, s.DisplayName, s.SortOrder))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<GrandPrixDto>> GetGrandPrixAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext
            .GrandPrix.OrderBy(g => g.Season)
            .ThenBy(g => g.SortOrder)
            .Select(g => new GrandPrixDto(g.Name, g.Season, g.SortOrder))
            .ToListAsync(cancellationToken);
    }
}
