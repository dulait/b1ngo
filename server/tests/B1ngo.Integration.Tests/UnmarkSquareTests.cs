using System.Net;

namespace B1ngo.Integration.Tests;

[Collection("Integration")]
public sealed class UnmarkSquareTests(B1ngoApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task UnmarkSquare_WhenSquareIsNotMarked_Returns409()
    {
        var room = await CreateRoom();
        await StartGame(room.RoomId, room.PlayerToken);

        var response = await UnmarkSquare(room.RoomId, room.PlayerId, room.PlayerToken, 0, 0);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task UnmarkSquare_AfterMarking_Returns200()
    {
        var room = await CreateRoom();
        await StartGame(room.RoomId, room.PlayerToken);

        await MarkSquare(room.RoomId, room.PlayerId, room.PlayerToken, 0, 0);
        var response = await UnmarkSquare(room.RoomId, room.PlayerId, room.PlayerToken, 0, 0);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
