using B1ngo.Application.Common.Ports;
using B1ngo.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace B1ngo.Infrastructure.ReferenceData;

internal sealed class ReferenceDataRepository(B1ngoDbContext dbContext) : IReferenceDataRepository
{
    public async Task<IReadOnlyList<GrandPrixDto>> GetGrandPrixAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext
            .GrandPrix.OrderByDescending(g => g.Season)
            .ThenBy(g => g.Round)
            .Select(g => new GrandPrixDto(g.Name, g.Season, g.Round, g.IsSprint, g.SessionTypes))
            .ToListAsync(cancellationToken);
    }

    public async Task<GrandPrixDto?> GetGrandPrixAsync(
        string name,
        int season,
        CancellationToken cancellationToken = default
    )
    {
        return await dbContext
            .GrandPrix.Where(g => g.Name == name && g.Season == season)
            .Select(g => new GrandPrixDto(g.Name, g.Season, g.Round, g.IsSprint, g.SessionTypes))
            .FirstOrDefaultAsync(cancellationToken);
    }
}
