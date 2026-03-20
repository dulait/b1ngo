using B1ngo.DataSync;
using B1ngo.DataSync.Jolpica;
using B1ngo.DataSync.Persistence;
using B1ngo.DataSync.Translation;
using B1ngo.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

var connectionString = args.Length > 0 ? args[0] : Environment.GetEnvironmentVariable("CONNECTION_STRING");

if (string.IsNullOrWhiteSpace(connectionString))
{
    Console.Error.WriteLine("Usage: B1ngo.DataSync <connection-string>");
    Console.Error.WriteLine("  or set CONNECTION_STRING environment variable.");
    return 1;
}

var startYear = 2021;
var endYear = DateTime.UtcNow.Year;

Console.WriteLine($"Syncing F1 data for seasons {startYear} to {endYear}...");

using var httpClient = new HttpClient();
httpClient.BaseAddress = new Uri("https://api.jolpi.ca/ergast/f1/");
httpClient.DefaultRequestHeaders.Add("User-Agent", "B1ngo-DataSync/1.0");

var client = new JolpicaClient(httpClient);
var translator = new JolpicaTranslator();

var options = new DbContextOptionsBuilder<B1ngoDbContext>().UseNpgsql(connectionString).Options;
var serviceProvider = new MinimalServiceProvider();
await using var dbContext = new B1ngoDbContext(options, serviceProvider, serviceProvider);

var seeder = new ReferenceDataSeeder(dbContext);
var allEntries = new List<GrandPrixSeedEntry>();

for (var year = startYear; year <= endYear; year++)
{
    Console.Write($"  Fetching {year}... ");

    try
    {
        var races = await client.FetchSeasonAsync(year);

        if (races.Count == 0)
        {
            Console.WriteLine("no data.");
            continue;
        }

        var entries = translator.Translate(races);
        allEntries.AddRange(entries);
        Console.WriteLine($"{entries.Count} races.");
    }
    catch (HttpRequestException ex)
    {
        Console.WriteLine($"failed: {ex.Message}");
    }

    if (year < endYear)
    {
        await Task.Delay(1000);
    }
}

Console.WriteLine($"\nTotal: {allEntries.Count} Grand Prix across {endYear - startYear + 1} seasons.");
Console.WriteLine("Upserting into database...");

await seeder.UpsertAsync(allEntries);

Console.WriteLine("Done.");
return 0;
