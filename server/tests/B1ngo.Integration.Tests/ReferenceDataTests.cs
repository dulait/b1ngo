using System.Net;
using System.Net.Http.Json;

namespace B1ngo.Integration.Tests;

[Collection("Integration")]
public sealed class ReferenceDataTests(B1ngoApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task GetReferenceData_ReturnsOkWithExpectedShape()
    {
        using var client = Factory.CreateClient();
        var response = await client.GetAsync("/api/v1/reference-data");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<ReferenceDataApiResponse>();
        Assert.NotNull(body);
        Assert.NotEmpty(body!.Seasons);
        Assert.NotEmpty(body.GrandPrix);
    }

    [Fact]
    public async Task GetReferenceData_SeasonsAreSortedDescending()
    {
        using var client = Factory.CreateClient();
        var response = await client.GetFromJsonAsync<ReferenceDataApiResponse>("/api/v1/reference-data");

        var seasons = response!.Seasons;
        for (var i = 1; i < seasons.Count; i++)
        {
            Assert.True(seasons[i - 1] >= seasons[i], "Seasons should be sorted descending.");
        }
    }

    [Fact]
    public async Task GetReferenceData_GrandPrixHaveRequiredFields()
    {
        using var client = Factory.CreateClient();
        var response = await client.GetFromJsonAsync<ReferenceDataApiResponse>("/api/v1/reference-data");

        foreach (var gp in response!.GrandPrix)
        {
            Assert.False(string.IsNullOrWhiteSpace(gp.Name));
            Assert.True(gp.Season >= 2021);
            Assert.True(gp.Round >= 1);
            Assert.NotEmpty(gp.SessionTypes);
        }
    }

    [Fact]
    public async Task GetReferenceData_StandardGpHasCorrectSessionTypes()
    {
        using var client = Factory.CreateClient();
        var response = await client.GetFromJsonAsync<ReferenceDataApiResponse>("/api/v1/reference-data");

        var standardGp = response!.GrandPrix.First(g => g.Name == TestGrandPrixName);

        Assert.False(standardGp.IsSprint);
        Assert.Equal(5, standardGp.SessionTypes.Count);
        Assert.Contains("FP1", standardGp.SessionTypes);
        Assert.Contains("FP2", standardGp.SessionTypes);
        Assert.Contains("FP3", standardGp.SessionTypes);
        Assert.Contains("Qualifying", standardGp.SessionTypes);
        Assert.Contains("Race", standardGp.SessionTypes);
    }

    [Fact]
    public async Task GetReferenceData_SprintGpHasCorrectSessionTypes()
    {
        using var client = Factory.CreateClient();
        var response = await client.GetFromJsonAsync<ReferenceDataApiResponse>("/api/v1/reference-data");

        var sprintGp = response!.GrandPrix.First(g => g.Name == TestSprintGrandPrixName);

        Assert.True(sprintGp.IsSprint);
        Assert.Equal(5, sprintGp.SessionTypes.Count);
        Assert.Contains("FP1", sprintGp.SessionTypes);
        Assert.Contains("SprintQualifying", sprintGp.SessionTypes);
        Assert.Contains("Sprint", sprintGp.SessionTypes);
        Assert.Contains("Qualifying", sprintGp.SessionTypes);
        Assert.Contains("Race", sprintGp.SessionTypes);
    }

    [Fact]
    public async Task GetReferenceData_IsPublicEndpoint()
    {
        using var client = Factory.CreateClient();
        var response = await client.GetAsync("/api/v1/reference-data");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetReferenceData_ResponseIsCacheable()
    {
        using var client = Factory.CreateClient();
        var response = await client.GetAsync("/api/v1/reference-data");

        var cacheControl = response.Headers.CacheControl;
        Assert.NotNull(cacheControl);
        Assert.True(cacheControl!.MaxAge?.TotalSeconds > 0);
    }

    // --- Response DTO ---

    private record ReferenceDataApiResponse(List<int> Seasons, List<GrandPrixApiResponse> GrandPrix);

    private record GrandPrixApiResponse(string Name, int Season, int Round, bool IsSprint, List<string> SessionTypes);
}
