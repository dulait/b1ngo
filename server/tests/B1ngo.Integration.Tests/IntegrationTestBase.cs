using System.Net.Http.Json;
using System.Text.Json;

namespace B1ngo.Integration.Tests;

[Collection("Integration")]
public abstract class IntegrationTestBase : IAsyncLifetime
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    protected B1ngoApiFactory Factory { get; }

    protected IntegrationTestBase(B1ngoApiFactory factory)
    {
        Factory = factory;
    }

    public async Task InitializeAsync()
    {
        await Factory.EnsureTestReferenceDataAsync();
    }

    public Task DisposeAsync() => Task.CompletedTask;

    // --- Constants for test reference data ---

    protected const string TestGrandPrixName = "Test Grand Prix";
    protected const string TestSprintGrandPrixName = "Test Sprint Grand Prix";
    protected const int TestSeason = 2026;

    // --- Room CRUD helpers ---

    protected async Task<CreateRoomResult> CreateRoom(string hostDisplayName = "Host", int matrixSize = 3)
    {
        using var client = Factory.CreateClient();
        var response = await client.PostAsJsonAsync(
            "/api/v1/rooms",
            new
            {
                hostDisplayName,
                matrixSize,
                season = TestSeason,
                grandPrixName = TestGrandPrixName,
                sessionType = "Race",
            }
        );

        response.EnsureSuccessStatusCode();

        var body = await response.Content.ReadFromJsonAsync<CreateRoomApiResponse>(JsonOptions);
        var playerToken = ExtractPlayerTokenFromCookie(response);
        return new CreateRoomResult(body!.RoomId, body.JoinCode, body.PlayerId, playerToken);
    }

    protected async Task<CreateRoomResult> CreateRoomWithPatterns(
        IReadOnlyList<string> winningPatterns,
        int matrixSize = 3,
        string hostDisplayName = "Host"
    )
    {
        using var client = Factory.CreateClient();
        var response = await client.PostAsJsonAsync(
            "/api/v1/rooms",
            new
            {
                hostDisplayName,
                matrixSize,
                season = TestSeason,
                grandPrixName = TestGrandPrixName,
                sessionType = "Race",
                winningPatterns,
            }
        );

        response.EnsureSuccessStatusCode();

        var body = await response.Content.ReadFromJsonAsync<CreateRoomApiResponse>(JsonOptions);
        var playerToken = ExtractPlayerTokenFromCookie(response);
        return new CreateRoomResult(body!.RoomId, body.JoinCode, body.PlayerId, playerToken);
    }

    protected async Task<HttpResponseMessage> CreateRoomRaw(object payload)
    {
        using var client = Factory.CreateClient();
        return await client.PostAsJsonAsync("/api/v1/rooms", payload);
    }

    protected async Task<JoinRoomResult> JoinRoom(string joinCode, string displayName = "Player2")
    {
        using var client = Factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/v1/rooms/join", new { joinCode, displayName });

        response.EnsureSuccessStatusCode();

        var body = await response.Content.ReadFromJsonAsync<JoinRoomApiResponse>(JsonOptions);
        var playerToken = ExtractPlayerTokenFromCookie(response);
        return new JoinRoomResult(body!.RoomId, body.PlayerId, playerToken, body.DisplayName);
    }

    protected async Task<HttpResponseMessage> JoinRoomRaw(object payload)
    {
        using var client = Factory.CreateClient();
        return await client.PostAsJsonAsync("/api/v1/rooms/join", payload);
    }

    protected async Task<HttpResponseMessage> StartGame(Guid roomId, Guid hostToken)
    {
        using var client = Factory.CreateAuthenticatedClient(hostToken);
        return await client.PostAsync($"/api/v1/rooms/{roomId}/start", null);
    }

    protected async Task<HttpResponseMessage> EndGame(Guid roomId, Guid hostToken)
    {
        using var client = Factory.CreateAuthenticatedClient(hostToken);
        return await client.PostAsync($"/api/v1/rooms/{roomId}/end", null);
    }

    protected async Task<HttpResponseMessage> EditSquare(
        Guid roomId,
        Guid playerToken,
        int row,
        int column,
        string displayText
    )
    {
        using var client = Factory.CreateAuthenticatedClient(playerToken);
        return await client.PutAsJsonAsync(
            $"/api/v1/rooms/{roomId}/players/me/card/squares/{row}/{column}",
            new { displayText }
        );
    }

    protected async Task<HttpResponseMessage> MarkSquare(
        Guid roomId,
        Guid playerId,
        Guid playerToken,
        int row,
        int column
    )
    {
        using var client = Factory.CreateAuthenticatedClient(playerToken);
        return await client.PostAsync(
            $"/api/v1/rooms/{roomId}/players/{playerId}/card/squares/{row}/{column}/mark",
            null
        );
    }

    protected async Task<HttpResponseMessage> UnmarkSquare(
        Guid roomId,
        Guid playerId,
        Guid playerToken,
        int row,
        int column
    )
    {
        using var client = Factory.CreateAuthenticatedClient(playerToken);
        return await client.PostAsync(
            $"/api/v1/rooms/{roomId}/players/{playerId}/card/squares/{row}/{column}/unmark",
            null
        );
    }

    protected async Task<HttpResponseMessage> GetRoomState(Guid roomId, Guid playerToken)
    {
        using var client = Factory.CreateAuthenticatedClient(playerToken);
        return await client.GetAsync($"/api/v1/rooms/{roomId}");
    }

    protected async Task<HttpResponseMessage> Reconnect(Guid playerToken)
    {
        using var client = Factory.CreateClient();
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/v1/rooms/reconnect");
        request.Headers.Add("Cookie", $"__bng_s={playerToken}");
        return await client.SendAsync(request);
    }

    // --- Composite helpers ---

    protected async Task<ActiveGameContext> SetupActiveGame(int matrixSize = 3, int playerCount = 1)
    {
        var room = await CreateRoom("Host", matrixSize);

        var players = new List<PlayerContext>();
        for (var i = 0; i < playerCount - 1; i++)
        {
            var joined = await JoinRoom(room.JoinCode, $"Player{i + 2}");
            players.Add(new PlayerContext(joined.PlayerId, joined.PlayerToken));
        }

        await StartGame(room.RoomId, room.PlayerToken);

        return new ActiveGameContext(
            room.RoomId,
            room.JoinCode,
            new PlayerContext(room.PlayerId, room.PlayerToken),
            players
        );
    }

    protected async Task<ActiveGameContext> SetupActiveGameWithPatterns(
        IReadOnlyList<string> winningPatterns,
        int matrixSize = 3,
        int playerCount = 1
    )
    {
        var room = await CreateRoomWithPatterns(winningPatterns, matrixSize);

        var players = new List<PlayerContext>();
        for (var i = 0; i < playerCount - 1; i++)
        {
            var joined = await JoinRoom(room.JoinCode, $"Player{i + 2}");
            players.Add(new PlayerContext(joined.PlayerId, joined.PlayerToken));
        }

        await StartGame(room.RoomId, room.PlayerToken);

        return new ActiveGameContext(
            room.RoomId,
            room.JoinCode,
            new PlayerContext(room.PlayerId, room.PlayerToken),
            players
        );
    }

    protected async Task<HttpResponseMessage> MarkRow(
        Guid roomId,
        Guid playerId,
        Guid playerToken,
        int row,
        int matrixSize = 3
    )
    {
        var center = matrixSize / 2;
        HttpResponseMessage? last = null;

        for (var col = 0; col < matrixSize; col++)
        {
            if (row == center && col == center)
            {
                continue;
            }

            last = await MarkSquare(roomId, playerId, playerToken, row, col);
        }

        return last!;
    }

    protected async Task<HttpResponseMessage> MarkColumn(
        Guid roomId,
        Guid playerId,
        Guid playerToken,
        int col,
        int matrixSize = 3
    )
    {
        var center = matrixSize / 2;
        HttpResponseMessage? last = null;

        for (var row = 0; row < matrixSize; row++)
        {
            if (row == center && col == center)
            {
                continue;
            }

            last = await MarkSquare(roomId, playerId, playerToken, row, col);
        }

        return last!;
    }

    protected async Task<HttpResponseMessage> MarkMainDiagonal(
        Guid roomId,
        Guid playerId,
        Guid playerToken,
        int matrixSize = 3
    )
    {
        var center = matrixSize / 2;
        HttpResponseMessage? last = null;

        for (var i = 0; i < matrixSize; i++)
        {
            if (i == center)
            {
                continue;
            }

            last = await MarkSquare(roomId, playerId, playerToken, i, i);
        }

        return last!;
    }

    protected async Task<HttpResponseMessage> MarkAntiDiagonal(
        Guid roomId,
        Guid playerId,
        Guid playerToken,
        int matrixSize = 3
    )
    {
        var center = matrixSize / 2;
        HttpResponseMessage? last = null;

        for (var i = 0; i < matrixSize; i++)
        {
            if (i == center && (matrixSize - 1 - i) == center)
            {
                continue;
            }

            last = await MarkSquare(roomId, playerId, playerToken, i, matrixSize - 1 - i);
        }

        return last!;
    }

    protected async Task<HttpResponseMessage> MarkAllNonFreeSquares(
        Guid roomId,
        Guid playerId,
        Guid playerToken,
        int matrixSize = 3
    )
    {
        var center = matrixSize / 2;
        HttpResponseMessage? last = null;

        for (var row = 0; row < matrixSize; row++)
        {
            for (var col = 0; col < matrixSize; col++)
            {
                if (row == center && col == center)
                {
                    continue;
                }

                last = await MarkSquare(roomId, playerId, playerToken, row, col);
            }
        }

        return last!;
    }

    protected async Task<List<LeaderboardEntryResponse>> GetLeaderboard(Guid roomId, Guid playerToken)
    {
        var response = await GetRoomState(roomId, playerToken);
        response.EnsureSuccessStatusCode();
        var state = await Deserialize<RoomStateResponse>(response);
        return state.Leaderboard;
    }

    // --- Deserialization ---

    protected static async Task<T> Deserialize<T>(HttpResponseMessage response)
    {
        var result = await response.Content.ReadFromJsonAsync<T>(JsonOptions);
        return result!;
    }

    // --- Context records ---

    protected record CreateRoomResult(Guid RoomId, string JoinCode, Guid PlayerId, Guid PlayerToken);

    protected record JoinRoomResult(Guid RoomId, Guid PlayerId, Guid PlayerToken, string DisplayName);

    protected record PlayerContext(Guid PlayerId, Guid PlayerToken);

    protected record ActiveGameContext(Guid RoomId, string JoinCode, PlayerContext Host, List<PlayerContext> Players);

    // --- Response DTOs ---

    protected record RoomStateResponse(
        Guid RoomId,
        Guid CurrentPlayerId,
        string JoinCode,
        string Status,
        SessionResponse Session,
        ConfigurationResponse Configuration,
        Guid HostPlayerId,
        List<PlayerResponse> Players,
        List<LeaderboardEntryResponse> Leaderboard
    );

    protected record SessionResponse(int Season, string GrandPrixName, string SessionType);

    protected record ConfigurationResponse(int MatrixSize, List<string> WinningPatterns);

    protected record PlayerResponse(Guid PlayerId, string DisplayName, bool HasWon, CardResponse? Card);

    protected record CardResponse(int MatrixSize, List<SquareResponse> Squares);

    protected record SquareResponse(
        int Row,
        int Column,
        string DisplayText,
        string? EventKey,
        bool IsFreeSpace,
        bool IsMarked,
        string? MarkedBy,
        DateTimeOffset? MarkedAt
    );

    protected record LeaderboardEntryResponse(
        Guid PlayerId,
        int Rank,
        string WinningPattern,
        List<SquarePositionResponse> WinningSquares,
        DateTimeOffset CompletedAt
    );

    protected record SquarePositionResponse(int Row, int Column);

    protected record MarkSquareApiResponse(
        int Row,
        int Column,
        bool IsMarked,
        string MarkedBy,
        DateTimeOffset MarkedAt,
        BingoInfoResponse? Bingo
    );

    protected record BingoInfoResponse(string Pattern, int Rank);

    protected record UnmarkSquareApiResponse(
        int Row,
        int Column,
        bool IsMarked,
        string? MarkedBy,
        DateTimeOffset? MarkedAt,
        bool WinRevoked
    );

    protected record ReconnectApiResponse(Guid RoomId, Guid PlayerId, string RoomStatus);

    // --- Private API response records ---

    private record CreateRoomApiResponse(Guid RoomId, string JoinCode, Guid PlayerId);

    private record JoinRoomApiResponse(Guid RoomId, Guid PlayerId, string DisplayName);

    protected static Guid ExtractPlayerTokenFromCookie(HttpResponseMessage response)
    {
        if (
            response.Headers.TryGetValues("Set-Cookie", out var cookies)
            && cookies.FirstOrDefault(c => c.StartsWith("__bng_s=", StringComparison.Ordinal)) is { } cookie
            && Guid.TryParse(cookie.Split('=', 2)[1].Split(';')[0], out var token)
        )
        {
            return token;
        }

        throw new InvalidOperationException("No __bng_s cookie found in response.");
    }
}
