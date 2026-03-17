using System.Net;
using System.Text.Json;

namespace B1ngo.Integration.Tests;

[Collection("Integration")]
public sealed class GameLifecycleTests(B1ngoApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task FullGameLifecycle_HappyPath_CompletesSuccessfully()
    {
        // 1. Create a room
        var room = await CreateRoom("HostPlayer", matrixSize: 3);
        Assert.NotEqual(Guid.Empty, room.RoomId);
        Assert.NotEmpty(room.JoinCode);

        // 2. Join with a second player
        var player2 = await JoinRoom(room.JoinCode, "Player2");
        Assert.Equal(room.RoomId, player2.RoomId);
        Assert.Equal("Player2", player2.DisplayName);

        // 3. Host edits a square (0,0 is not the free space on a 3x3 — center is 1,1)
        var editResponse = await EditSquare(room.RoomId, room.PlayerToken, 0, 0, "Custom Event");
        Assert.Equal(HttpStatusCode.OK, editResponse.StatusCode);

        // 4. Start the game
        var startResponse = await StartGame(room.RoomId, room.PlayerToken);
        Assert.Equal(HttpStatusCode.OK, startResponse.StatusCode);

        // 5. Verify room status is Active
        var stateResponse = await GetRoomState(room.RoomId, room.PlayerToken);
        Assert.Equal(HttpStatusCode.OK, stateResponse.StatusCode);
        var state = await Deserialize<RoomStateDto>(stateResponse);
        Assert.Equal("Active", state.Status);

        // 6. Mark a square on host's card
        var markResponse = await MarkSquare(room.RoomId, room.PlayerId, room.PlayerToken, 0, 0);
        Assert.Equal(HttpStatusCode.OK, markResponse.StatusCode);

        // 7. Unmark the square
        var unmarkResponse = await UnmarkSquare(room.RoomId, room.PlayerId, room.PlayerToken, 0, 0);
        Assert.Equal(HttpStatusCode.OK, unmarkResponse.StatusCode);

        // 8. End the game
        var endResponse = await EndGame(room.RoomId, room.PlayerToken);
        Assert.Equal(HttpStatusCode.OK, endResponse.StatusCode);

        // 9. Verify room status is Completed
        var finalState = await GetRoomState(room.RoomId, room.PlayerToken);
        Assert.Equal(HttpStatusCode.OK, finalState.StatusCode);
        var completedState = await Deserialize<RoomStateDto>(finalState);
        Assert.Equal("Completed", completedState.Status);
    }

    private record RoomStateDto(Guid RoomId, string Status);
}
