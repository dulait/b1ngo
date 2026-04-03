using System.Net;

namespace B1ngo.Integration.Tests;

[Collection("Integration")]
public sealed class JoinRoomTests(B1ngoApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task JoinRoom_WithValidCode_ReturnsPlayerInfo()
    {
        var room = await CreateRoom();

        var player = await JoinRoom(room.JoinCode, "NewPlayer");

        Assert.Equal(room.RoomId, player.RoomId);
        Assert.NotEqual(Guid.Empty, player.PlayerId);
        Assert.Equal("NewPlayer", player.DisplayName);
    }

    [Fact]
    public async Task JoinRoom_WithInvalidJoinCode_Returns404()
    {
        var response = await JoinRoomRaw(new { joinCode = "ZZZZZZ", displayName = "Player" });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task JoinRoom_WithDuplicateDisplayName_Returns409()
    {
        var room = await CreateRoom("HostPlayer");

        var response = await JoinRoomRaw(new { joinCode = room.JoinCode, displayName = "HostPlayer" });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task JoinRoom_WhenRoomIsNotInLobby_Returns409()
    {
        var room = await CreateRoom();
        await StartGame(room.RoomId, room.PlayerToken);

        var response = await JoinRoomRaw(new { joinCode = room.JoinCode, displayName = "LatePlayer" });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task JoinRoom_WithEmptyDisplayName_Returns400()
    {
        var room = await CreateRoom();

        var response = await JoinRoomRaw(new { joinCode = room.JoinCode, displayName = "" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task JoinRoom_WithNameTooLong_Returns400()
    {
        var room = await CreateRoom();

        var response = await JoinRoomRaw(new { joinCode = room.JoinCode, displayName = new string('B', 51) });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task JoinRoom_WithWrongCodeLength_Returns400()
    {
        var response = await JoinRoomRaw(new { joinCode = "ABC", displayName = "Player" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
