using System.Net;

namespace B1ngo.Integration.Tests;

[Collection("Integration")]
public sealed class ReconnectTests(B1ngoApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task Reconnect_WithValidToken_Returns200WithRoomInfo()
    {
        var room = await CreateRoom();

        var response = await Reconnect(room.PlayerToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await Deserialize<ReconnectApiResponse>(response);
        Assert.Equal(room.RoomId, body.RoomId);
        Assert.Equal(room.PlayerId, body.PlayerId);
        Assert.Equal("Lobby", body.RoomStatus);
    }

    [Fact]
    public async Task Reconnect_WithNoToken_Returns401()
    {
        using var client = Factory.CreateClient();

        var response = await client.PostAsync("/api/v1/rooms/reconnect", null);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Reconnect_InActiveRoom_Returns200()
    {
        var room = await CreateRoom();
        await StartGame(room.RoomId, room.PlayerToken);

        var response = await Reconnect(room.PlayerToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await Deserialize<ReconnectApiResponse>(response);
        Assert.Equal("Active", body.RoomStatus);
    }

    [Fact]
    public async Task Reconnect_InCompletedRoom_Returns200()
    {
        var room = await CreateRoom();
        await StartGame(room.RoomId, room.PlayerToken);
        await EndGame(room.RoomId, room.PlayerToken);

        var response = await Reconnect(room.PlayerToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await Deserialize<ReconnectApiResponse>(response);
        Assert.Equal("Completed", body.RoomStatus);
    }

    [Fact]
    public async Task Reconnect_WithInvalidToken_Returns401()
    {
        var response = await Reconnect(Guid.NewGuid());

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
