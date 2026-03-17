using System.Net;

namespace B1ngo.Integration.Tests;

[Collection("Integration")]
public sealed class EndGameTests(B1ngoApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task EndGame_WhenNonHostTriesToEnd_Returns403()
    {
        var room = await CreateRoom();
        var player2 = await JoinRoom(room.JoinCode);
        await StartGame(room.RoomId, room.PlayerToken);

        var response = await EndGame(room.RoomId, player2.PlayerToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task EndGame_WhenRoomIsInLobby_Returns409()
    {
        var room = await CreateRoom();

        var response = await EndGame(room.RoomId, room.PlayerToken);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }
}
