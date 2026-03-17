using System.Net;
using System.Text.Json;

namespace B1ngo.Integration.Tests;

[Collection("Integration")]
public sealed class GetRoomStateTests(B1ngoApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task GetRoomState_WithNoToken_Returns401()
    {
        var room = await CreateRoom();

        using var client = Factory.CreateClient();
        var response = await client.GetAsync($"/api/v1/rooms/{room.RoomId}");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetRoomState_WithNonExistentRoom_Returns404()
    {
        var room = await CreateRoom();
        var fakeRoomId = Guid.NewGuid();

        // Token is valid but for a different room — should return 403 (room ID mismatch)
        var response = await GetRoomState(fakeRoomId, room.PlayerToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task GetRoomState_WithValidToken_Returns200WithCorrectShape()
    {
        var room = await CreateRoom("TestHost", matrixSize: 3);

        var response = await GetRoomState(room.RoomId, room.PlayerToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var state = await Deserialize<RoomStateResponse>(response);
        Assert.Equal(room.RoomId, state.RoomId);
        Assert.Equal("Lobby", state.Status);
        Assert.NotNull(state.Session);
        Assert.NotNull(state.Configuration);
        Assert.NotEmpty(state.Players);
        Assert.Equal(room.PlayerId, state.HostPlayerId);
    }

    private record RoomStateResponse(
        Guid RoomId,
        string JoinCode,
        string Status,
        SessionDto Session,
        ConfigurationDto Configuration,
        Guid HostPlayerId,
        List<PlayerDto> Players,
        List<object> Leaderboard
    );

    private record SessionDto(int Season, string GrandPrixName, string SessionType);

    private record ConfigurationDto(int MatrixSize, List<string> WinningPatterns);

    private record PlayerDto(Guid PlayerId, string DisplayName, bool HasWon);
}
