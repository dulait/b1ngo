using System.Net;

namespace B1ngo.Integration.Tests;

[Collection("Integration")]
public sealed class ValidationTests(B1ngoApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task CreateRoom_HostDisplayNameExactly50Chars_Returns200()
    {
        var response = await CreateRoomRaw(
            new
            {
                hostDisplayName = new string('A', 50),
                season = TestSeason,
                grandPrixName = TestGrandPrixName,
                sessionType = "Race",
                matrixSize = 3,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task CreateRoom_HostDisplayName51Chars_Returns400()
    {
        var response = await CreateRoomRaw(
            new
            {
                hostDisplayName = new string('A', 51),
                season = TestSeason,
                grandPrixName = TestGrandPrixName,
                sessionType = "Race",
                matrixSize = 3,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task JoinRoom_DisplayNameExactly50Chars_Returns200()
    {
        var room = await CreateRoom();

        var player = await JoinRoom(room.JoinCode, new string('B', 50));

        Assert.NotEqual(Guid.Empty, player.PlayerId);
    }

    [Fact]
    public async Task JoinRoom_JoinCodeExactly6Chars_DoesNotReturn400()
    {
        // 6-char code passes validation even if the room doesn't exist (returns 404, not 400)
        var response = await JoinRoomRaw(new { joinCode = "ABCDEF", displayName = "Player" });

        Assert.NotEqual(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task JoinRoom_JoinCode5Chars_Returns400()
    {
        var response = await JoinRoomRaw(new { joinCode = "ABCDE", displayName = "Player" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task JoinRoom_JoinCode7Chars_Returns400()
    {
        var response = await JoinRoomRaw(new { joinCode = "ABCDEFG", displayName = "Player" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task EditSquare_DisplayTextExactly200Chars_Returns200()
    {
        var room = await CreateRoom();

        var response = await EditSquare(room.RoomId, room.PlayerToken, 0, 0, new string('X', 200));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task EditSquare_DisplayText201Chars_Returns400()
    {
        var room = await CreateRoom();

        var response = await EditSquare(room.RoomId, room.PlayerToken, 0, 0, new string('X', 201));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateRoom_GrandPrixNameExactly100Chars_Returns400()
    {
        var response = await CreateRoomRaw(
            new
            {
                hostDisplayName = "Host",
                season = TestSeason,
                grandPrixName = new string('G', 100),
                sessionType = "Race",
                matrixSize = 3,
            }
        );

        // A 100-char GP name doesn't match any seeded reference data, so session type validation rejects it
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateRoom_MatrixSize3_Returns200()
    {
        var room = await CreateRoom(matrixSize: 3);

        Assert.NotEqual(Guid.Empty, room.RoomId);
    }
}
