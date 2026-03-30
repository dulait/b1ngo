using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace B1ngo.Integration.Tests;

[Collection("Integration")]
public class UserActivityTests(B1ngoApiFactory factory) : IntegrationTestBase(factory)
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    // --- Auth helpers ---

    private static HttpRequestMessage CreateAuthRequest(HttpMethod method, string url, object? body = null)
    {
        var request = new HttpRequestMessage(method, url);
        request.Headers.Add("X-Requested-With", "XMLHttpRequest");
        if (body is not null)
        {
            request.Content = JsonContent.Create(body);
        }
        return request;
    }

    private async Task<HttpClient> CreateAuthenticatedIdentityClient()
    {
        var client = Factory.CreateClient(new() { HandleCookies = true });
        var email = $"activity-{Guid.NewGuid()}@example.com";
        var register = CreateAuthRequest(
            HttpMethod.Post,
            "/api/v1/auth/register",
            new
            {
                email,
                password = "Password1",
                displayName = "TestPlayer",
            }
        );
        (await client.SendAsync(register)).EnsureSuccessStatusCode();
        return client;
    }

    private async Task<CreateRoomApiResponse> CreateRoomWithClient(HttpClient client)
    {
        var response = await client.PostAsJsonAsync(
            "/api/v1/rooms",
            new
            {
                hostDisplayName = "TestPlayer",
                matrixSize = 3,
                season = TestSeason,
                grandPrixName = TestGrandPrixName,
                sessionType = "Race",
            }
        );
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<CreateRoomApiResponse>(JsonOptions))!;
    }

    private async Task CompleteGameWithWin(Guid roomId, Guid playerId, Guid playerToken)
    {
        using var startClient = Factory.CreateAuthenticatedClient(playerToken);
        (await startClient.PostAsync($"/api/v1/rooms/{roomId}/start", null)).EnsureSuccessStatusCode();

        await MarkRow(roomId, playerId, playerToken, row: 0, matrixSize: 3);

        using var endClient = Factory.CreateAuthenticatedClient(playerToken);
        (await endClient.PostAsync($"/api/v1/rooms/{roomId}/end", null)).EnsureSuccessStatusCode();
    }

    // --- Dashboard ---

    [Fact]
    public async Task GetDashboard_WhenAuthenticated_Returns200WithCorrectShape()
    {
        using var client = await CreateAuthenticatedIdentityClient();
        var room = await CreateRoomWithClient(client);

        var response = await client.GetAsync("/api/v1/dashboard");

        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadFromJsonAsync<DashboardApiResponse>(JsonOptions);
        Assert.NotNull(body);
        Assert.Equal("TestPlayer", body.DisplayName);
        Assert.True(body.ActiveRooms.Count >= 1);
        Assert.True(body.TotalActiveRooms >= 1);
        Assert.NotNull(body.QuickStats);
    }

    [Fact]
    public async Task GetDashboard_WhenUnauthenticated_Returns401()
    {
        using var client = Factory.CreateClient();
        var response = await client.GetAsync("/api/v1/dashboard");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetDashboard_ActiveRoomsCappedAt5()
    {
        using var client = await CreateAuthenticatedIdentityClient();

        for (var i = 0; i < 7; i++)
        {
            await CreateRoomWithClient(client);
        }

        var response = await client.GetAsync("/api/v1/dashboard");
        response.EnsureSuccessStatusCode();

        var body = (await response.Content.ReadFromJsonAsync<DashboardApiResponse>(JsonOptions))!;
        Assert.Equal(5, body.ActiveRooms.Count);
        Assert.Equal(7, body.TotalActiveRooms);
    }

    [Fact]
    public async Task GetDashboard_QuickStatsReflectCompletedGames()
    {
        using var client = await CreateAuthenticatedIdentityClient();
        var room = await CreateRoomWithClient(client);
        await CompleteGameWithWin(room.RoomId, room.PlayerId, room.PlayerToken);

        var response = await client.GetAsync("/api/v1/dashboard");
        response.EnsureSuccessStatusCode();

        var body = (await response.Content.ReadFromJsonAsync<DashboardApiResponse>(JsonOptions))!;
        Assert.True(body.QuickStats.GamesPlayed >= 1);
    }

    // --- History ---

    [Fact]
    public async Task GetHistory_WhenAuthenticated_Returns200WithActiveAndCompletedRooms()
    {
        using var client = await CreateAuthenticatedIdentityClient();
        var room1 = await CreateRoomWithClient(client);
        var room2 = await CreateRoomWithClient(client);
        await CompleteGameWithWin(room2.RoomId, room2.PlayerId, room2.PlayerToken);

        var response = await client.GetAsync("/api/v1/history");
        response.EnsureSuccessStatusCode();

        var body = (await response.Content.ReadFromJsonAsync<HistoryApiResponse>(JsonOptions))!;
        Assert.True(body.ActiveRooms.Count >= 1);
        Assert.True(body.CompletedRooms.Items.Count >= 1);
        Assert.True(body.CompletedRooms.TotalCount >= 1);
    }

    [Fact]
    public async Task GetHistory_Pagination_Works()
    {
        using var client = await CreateAuthenticatedIdentityClient();

        for (var i = 0; i < 3; i++)
        {
            var room = await CreateRoomWithClient(client);
            await CompleteGameWithWin(room.RoomId, room.PlayerId, room.PlayerToken);
        }

        var page1 = await client.GetAsync("/api/v1/history?page=1&pageSize=2");
        page1.EnsureSuccessStatusCode();
        var body1 = (await page1.Content.ReadFromJsonAsync<HistoryApiResponse>(JsonOptions))!;
        Assert.Equal(2, body1.CompletedRooms.Items.Count);
        Assert.True(body1.CompletedRooms.HasNextPage);

        var page2 = await client.GetAsync("/api/v1/history?page=2&pageSize=2");
        page2.EnsureSuccessStatusCode();
        var body2 = (await page2.Content.ReadFromJsonAsync<HistoryApiResponse>(JsonOptions))!;
        Assert.True(body2.CompletedRooms.Items.Count >= 1);
    }

    [Fact]
    public async Task GetHistory_WhenUnauthenticated_Returns401()
    {
        using var client = Factory.CreateClient();
        var response = await client.GetAsync("/api/v1/history");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    // --- Stats ---

    [Fact]
    public async Task GetStats_WhenAuthenticated_Returns200WithAggregatedData()
    {
        using var client = await CreateAuthenticatedIdentityClient();
        var room = await CreateRoomWithClient(client);
        await CompleteGameWithWin(room.RoomId, room.PlayerId, room.PlayerToken);

        var response = await client.GetAsync("/api/v1/stats");
        response.EnsureSuccessStatusCode();

        var body = (await response.Content.ReadFromJsonAsync<StatsApiResponse>(JsonOptions))!;
        Assert.NotNull(body.Overview);
        Assert.True(body.Overview.GamesPlayed >= 1);
        Assert.True(body.Overview.Wins >= 1);
        Assert.NotNull(body.WinsByPattern);
    }

    [Fact]
    public async Task GetStats_WhenUnauthenticated_Returns401()
    {
        using var client = Factory.CreateClient();
        var response = await client.GetAsync("/api/v1/stats");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetStats_WithNoCompletedGames_ReturnsZeros()
    {
        using var client = await CreateAuthenticatedIdentityClient();

        var response = await client.GetAsync("/api/v1/stats");
        response.EnsureSuccessStatusCode();

        var body = (await response.Content.ReadFromJsonAsync<StatsApiResponse>(JsonOptions))!;
        Assert.Equal(0, body.Overview.GamesPlayed);
        Assert.Equal(0, body.Overview.Wins);
        Assert.Equal(0m, body.Overview.WinRate);
        Assert.Equal(0, body.WinsByPattern.Row);
        Assert.Equal(0, body.WinsByPattern.Column);
        Assert.Equal(0, body.WinsByPattern.Diagonal);
        Assert.Equal(0, body.WinsByPattern.Blackout);
        Assert.Empty(body.BestFinishes);
    }

    [Fact]
    public async Task GetStats_WinBreakdownMatchesLeaderboard()
    {
        using var client = await CreateAuthenticatedIdentityClient();
        var room = await CreateRoomWithClient(client);
        await CompleteGameWithWin(room.RoomId, room.PlayerId, room.PlayerToken);

        var response = await client.GetAsync("/api/v1/stats");
        response.EnsureSuccessStatusCode();

        var body = (await response.Content.ReadFromJsonAsync<StatsApiResponse>(JsonOptions))!;
        var totalWinsByPattern =
            body.WinsByPattern.Row
            + body.WinsByPattern.Column
            + body.WinsByPattern.Diagonal
            + body.WinsByPattern.Blackout;
        Assert.Equal(body.Overview.Wins, totalWinsByPattern);
    }

    // --- Response DTOs ---

    private record DashboardApiResponse(
        string DisplayName,
        List<ActiveRoomApiDto> ActiveRooms,
        int TotalActiveRooms,
        QuickStatsApiDto QuickStats
    );

    private record ActiveRoomApiDto(
        Guid RoomId,
        Guid PlayerId,
        string GpName,
        string SessionType,
        int PlayerCount,
        string Status,
        bool IsHost,
        DateTimeOffset JoinedAt
    );

    private record QuickStatsApiDto(int GamesPlayed, int Wins, decimal WinRate);

    private record HistoryApiResponse(List<ActiveRoomApiDto> ActiveRooms, PagedCompletedRoomsApiDto CompletedRooms);

    private record PagedCompletedRoomsApiDto(
        List<CompletedRoomApiDto> Items,
        int Page,
        int PageSize,
        int TotalCount,
        int TotalPages,
        bool HasNextPage,
        bool HasPreviousPage
    );

    private record CompletedRoomApiDto(
        Guid RoomId,
        string GpName,
        string SessionType,
        int PlayerCount,
        DateTimeOffset CompletedAt,
        int? ResultRank,
        string? WinPattern
    );

    private record StatsApiResponse(
        QuickStatsApiDto Overview,
        WinsByPatternApiDto WinsByPattern,
        List<RankCountApiDto> BestFinishes
    );

    private record WinsByPatternApiDto(int Row, int Column, int Diagonal, int Blackout);

    private record RankCountApiDto(int Rank, int Count);

    private record CreateRoomApiResponse(Guid RoomId, string JoinCode, Guid PlayerId, Guid PlayerToken);
}
