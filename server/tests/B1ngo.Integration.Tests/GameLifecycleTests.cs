using System.Net;

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

        // 3. Host edits a square (0,0 is not the free space on a 3x3)
        var editResponse = await EditSquare(room.RoomId, room.PlayerToken, 0, 0, "Custom Event");
        Assert.Equal(HttpStatusCode.OK, editResponse.StatusCode);

        // 4. Start the game
        var startResponse = await StartGame(room.RoomId, room.PlayerToken);
        Assert.Equal(HttpStatusCode.OK, startResponse.StatusCode);

        // 5. Verify room status is Active
        var stateResponse = await GetRoomState(room.RoomId, room.PlayerToken);
        Assert.Equal(HttpStatusCode.OK, stateResponse.StatusCode);
        var state = await Deserialize<RoomStateResponse>(stateResponse);
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
        var completedState = await Deserialize<RoomStateResponse>(finalState);
        Assert.Equal("Completed", completedState.Status);
    }

    [Fact]
    public async Task FullGameLifecycle_WithWinAndRevocation()
    {
        var game = await SetupActiveGame(matrixSize: 3);

        // Win via row 0
        var winMark = await MarkRow(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 0, matrixSize: 3);
        var winBody = await Deserialize<MarkSquareApiResponse>(winMark);
        Assert.NotNull(winBody.Bingo);
        Assert.Equal("Row", winBody.Bingo.Pattern);

        // Unmark (0,1) to revoke the row win
        var unmark = await UnmarkSquare(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 0, 1);
        var unmarkBody = await Deserialize<UnmarkSquareApiResponse>(unmark);
        Assert.True(unmarkBody.WinRevoked);

        // Re-mark (0,1) to re-win with the same pattern
        var reWin = await MarkSquare(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 0, 1);
        var reWinBody = await Deserialize<MarkSquareApiResponse>(reWin);
        Assert.NotNull(reWinBody.Bingo);
        Assert.Equal("Row", reWinBody.Bingo.Pattern);

        // End game and verify final state
        await EndGame(game.RoomId, game.Host.PlayerToken);

        var state = await Deserialize<RoomStateResponse>(
            await GetRoomState(game.RoomId, game.Host.PlayerToken));
        Assert.Equal("Completed", state.Status);

        var entry = Assert.Single(state.Leaderboard);
        Assert.Equal("Row", entry.WinningPattern);
        Assert.Equal(3, entry.WinningSquares.Count);
    }

    [Fact]
    public async Task FullGameLifecycle_MultipleWinners()
    {
        var game = await SetupActiveGame(matrixSize: 3, playerCount: 2);
        var player2 = game.Players[0];

        // Host wins first via row 0
        await MarkRow(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 0, matrixSize: 3);

        // Player2 wins second via row 0
        await MarkRow(game.RoomId, player2.PlayerId, player2.PlayerToken, 0, matrixSize: 3);

        var leaderboard = await GetLeaderboard(game.RoomId, game.Host.PlayerToken);
        Assert.Equal(2, leaderboard.Count);

        var rank1 = leaderboard.Single(e => e.Rank == 1);
        var rank2 = leaderboard.Single(e => e.Rank == 2);
        Assert.Equal(game.Host.PlayerId, rank1.PlayerId);
        Assert.Equal(player2.PlayerId, rank2.PlayerId);

        Assert.Equal(3, rank1.WinningSquares.Count);
        Assert.Equal(3, rank2.WinningSquares.Count);
    }
}
