using System.Net;

namespace B1ngo.Integration.Tests;

[Collection("Integration")]
public sealed class EndGameTests(B1ngoApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task EndGame_AsHost_Returns200()
    {
        var game = await SetupActiveGame();

        var response = await EndGame(game.RoomId, game.Host.PlayerToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var stateResponse = await GetRoomState(game.RoomId, game.Host.PlayerToken);
        var state = await Deserialize<RoomStateResponse>(stateResponse);
        Assert.Equal("Completed", state.Status);
    }

    [Fact]
    public async Task EndGame_WhenNonHostTriesToEnd_Returns403()
    {
        var game = await SetupActiveGame(playerCount: 2);
        var player2 = game.Players[0];

        var response = await EndGame(game.RoomId, player2.PlayerToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task EndGame_WhenRoomIsInLobby_Returns409()
    {
        var room = await CreateRoom();

        var response = await EndGame(room.RoomId, room.PlayerToken);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task EndGame_WithLeaderboard_PreservesLeaderboardInCompletedState()
    {
        var game = await SetupActiveGame(matrixSize: 3);

        // Win via row 0
        await MarkRow(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 0, matrixSize: 3);

        // End game
        await EndGame(game.RoomId, game.Host.PlayerToken);

        // Verify leaderboard persists in completed state
        var stateResponse = await GetRoomState(game.RoomId, game.Host.PlayerToken);
        var state = await Deserialize<RoomStateResponse>(stateResponse);
        Assert.Equal("Completed", state.Status);

        var entry = Assert.Single(state.Leaderboard);
        Assert.Equal(game.Host.PlayerId, entry.PlayerId);
        Assert.Equal("Row", entry.WinningPattern);
        Assert.Equal(3, entry.WinningSquares.Count);
    }
}
