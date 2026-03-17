using System.Net;

namespace B1ngo.Integration.Tests;

[Collection("Integration")]
public sealed class StartGameTests(B1ngoApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task StartGame_WithNoToken_Returns401()
    {
        var room = await CreateRoom();

        using var client = Factory.CreateClient();
        var response = await client.PostAsync($"/api/v1/rooms/{room.RoomId}/start", null);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task StartGame_WhenNonHostTriesToStart_Returns403()
    {
        var room = await CreateRoom();
        var player2 = await JoinRoom(room.JoinCode);

        var response = await StartGame(room.RoomId, player2.PlayerToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task StartGame_WhenRoomAlreadyActive_Returns409()
    {
        var room = await CreateRoom();
        await StartGame(room.RoomId, room.PlayerToken);

        var response = await StartGame(room.RoomId, room.PlayerToken);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }
}
