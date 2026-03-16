using System.Net;
using System.Text.Json;

namespace B1ngo.Web.Tests;

public sealed class OpenApiSpecTests : IClassFixture<B1ngoWebApplicationFactory>
{
    private readonly HttpClient _client;

    public OpenApiSpecTests(B1ngoWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task OpenApi_Endpoint_Returns_Valid_Spec()
    {
        var response = await _client.GetAsync("/openapi/v1.json");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        var doc = JsonDocument.Parse(content);

        Assert.StartsWith("3.1", doc.RootElement.GetProperty("openapi").GetString());
    }

    [Fact]
    public async Task Generate_OpenApi_Spec_File()
    {
        var response = await _client.GetAsync("/openapi/v1.json");
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();

        var doc = JsonDocument.Parse(content);
        var formatted = JsonSerializer.Serialize(doc, new JsonSerializerOptions { WriteIndented = true });

        var repoRoot = FindRepoRoot();
        var outputPath = Path.Combine(repoRoot, "docs", "openapi.v1.json");
        Directory.CreateDirectory(Path.GetDirectoryName(outputPath)!);

        await File.WriteAllTextAsync(outputPath, formatted);

        Assert.True(File.Exists(outputPath));
    }

    private static string FindRepoRoot()
    {
        var dir = AppContext.BaseDirectory;
        while (dir is not null)
        {
            if (Directory.Exists(Path.Combine(dir, ".git")))
            {
                return dir;
            }

            dir = Directory.GetParent(dir)?.FullName;
        }

        throw new InvalidOperationException("Could not find repository root.");
    }
}
