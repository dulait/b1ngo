using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace B1ngo.Integration.Tests;

[Collection("Integration")]
public abstract class IntegrationTestBase
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

    protected async Task<CreateRoomResult> CreateRoom(string hostDisplayName = "Host", int matrixSize = 3)
    {
        using var client = Factory.CreateClient();
        var response = await client.PostAsJsonAsync(
            "/api/v1/rooms",
            new
            {
                hostDisplayName,
                matrixSize,
                season = 2026,
                grandPrixName = "Monaco",
                sessionType = 6, // SessionType.Race
            }
        );

        response.EnsureSuccessStatusCode();

        var body = await response.Content.ReadFromJsonAsync<CreateRoomApiResponse>(JsonOptions);
        return new CreateRoomResult(body!.RoomId, body.JoinCode, body.PlayerId, body.PlayerToken);
    }

    protected async Task<JoinRoomResult> JoinRoom(string joinCode, string displayName = "Player2")
    {
        using var client = Factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/v1/rooms/join", new { joinCode, displayName });

        response.EnsureSuccessStatusCode();

        var body = await response.Content.ReadFromJsonAsync<JoinRoomApiResponse>(JsonOptions);
        return new JoinRoomResult(body!.RoomId, body.PlayerId, body.PlayerToken, body.DisplayName);
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
        using var client = Factory.CreateAuthenticatedClient(playerToken);
        return await client.PostAsync("/api/v1/rooms/reconnect", null);
    }

    protected static async Task<T> Deserialize<T>(HttpResponseMessage response)
    {
        var result = await response.Content.ReadFromJsonAsync<T>(JsonOptions);
        return result!;
    }

    protected record CreateRoomResult(Guid RoomId, string JoinCode, Guid PlayerId, Guid PlayerToken);

    protected record JoinRoomResult(Guid RoomId, Guid PlayerId, Guid PlayerToken, string DisplayName);

    private record CreateRoomApiResponse(Guid RoomId, string JoinCode, Guid PlayerId, Guid PlayerToken);

    private record JoinRoomApiResponse(Guid RoomId, Guid PlayerId, Guid PlayerToken, string DisplayName);
}
