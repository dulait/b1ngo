using System.Net;
using System.Net.Http.Json;

namespace B1ngo.Integration.Tests;

[Collection("Integration")]
public sealed class JoinRoomTests(B1ngoApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task JoinRoom_WithInvalidJoinCode_Returns404()
    {
        using var client = Factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/v1/rooms/join", new
        {
            joinCode = "ZZZZZZ",
            displayName = "Player",
        });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task JoinRoom_WithDuplicateDisplayName_Returns409()
    {
        var room = await CreateRoom("HostPlayer");

        using var client = Factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/v1/rooms/join", new
        {
            joinCode = room.JoinCode,
            displayName = "HostPlayer",
        });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task JoinRoom_WhenRoomIsNotInLobby_Returns409()
    {
        var room = await CreateRoom();
        await StartGame(room.RoomId, room.PlayerToken);

        using var client = Factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/v1/rooms/join", new
        {
            joinCode = room.JoinCode,
            displayName = "LatePlayer",
        });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }
}
