using B1ngo.DataSync.Translation;
using B1ngo.Infrastructure.Persistence;
using B1ngo.Infrastructure.ReferenceData;
using Microsoft.EntityFrameworkCore;

namespace B1ngo.DataSync.Persistence;

internal sealed class ReferenceDataSeeder(B1ngoDbContext dbContext)
{
    public async Task UpsertAsync(IReadOnlyList<GrandPrixSeedEntry> entries)
    {
        foreach (var entry in entries)
        {
            var existing = await dbContext.GrandPrix.FirstOrDefaultAsync(g =>
                g.Name == entry.Name && g.Season == entry.Season
            );

            if (existing is not null)
            {
                existing.Round = entry.Round;
                existing.IsSprint = entry.IsSprint;
                existing.SessionTypes = entry.SessionTypes;
            }
            else
            {
                dbContext.GrandPrix.Add(
                    new GrandPrixEntity
                    {
                        Name = entry.Name,
                        Season = entry.Season,
                        Round = entry.Round,
                        IsSprint = entry.IsSprint,
                        SessionTypes = entry.SessionTypes,
                    }
                );
            }
        }

        await dbContext.SaveChangesAsync();
    }
}
