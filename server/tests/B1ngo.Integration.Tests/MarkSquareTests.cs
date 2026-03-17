using System.Net;

namespace B1ngo.Integration.Tests;

[Collection("Integration")]
public sealed class MarkSquareTests(B1ngoApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task MarkSquare_WithNoToken_Returns401()
    {
        var room = await CreateRoom();
        await StartGame(room.RoomId, room.PlayerToken);

        using var client = Factory.CreateClient();
        var response = await client.PostAsync(
            $"/api/v1/rooms/{room.RoomId}/players/{room.PlayerId}/card/squares/0/0/mark", null);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task MarkSquare_WhenRoomIsInLobby_Returns409()
    {
        var room = await CreateRoom();

        var response = await MarkSquare(room.RoomId, room.PlayerId, room.PlayerToken, 0, 0);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task MarkSquare_WithValidData_Returns200()
    {
        var room = await CreateRoom();
        await StartGame(room.RoomId, room.PlayerToken);

        var response = await MarkSquare(room.RoomId, room.PlayerId, room.PlayerToken, 0, 0);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
