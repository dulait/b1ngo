using B1ngo.Infrastructure.ReferenceData;

namespace B1ngo.Infrastructure.Persistence;

public static class TestDataSeeder
{
    public static async Task SeedTestReferenceDataAsync(B1ngoDbContext dbContext)
    {
        if (dbContext.GrandPrix.Any())
        {
            return;
        }

        dbContext.GrandPrix.AddRange(
            new GrandPrixEntity
            {
                Name = "Test Grand Prix",
                Season = 2026,
                Round = 1,
                IsSprint = false,
                SessionTypes = ["FP1", "FP2", "FP3", "Qualifying", "Race"],
            },
            new GrandPrixEntity
            {
                Name = "Test Sprint Grand Prix",
                Season = 2026,
                Round = 2,
                IsSprint = true,
                SessionTypes = ["FP1", "SprintQualifying", "Sprint", "Qualifying", "Race"],
            }
        );

        await dbContext.SaveChangesAsync();
    }
}
