using System.Net;

namespace B1ngo.Integration.Tests;

[Collection("Integration")]
public sealed class UnmarkSquareTests(B1ngoApiFactory factory) : IntegrationTestBase(factory)
{
    #region Basic

    [Fact]
    public async Task UnmarkSquare_AfterMarking_Returns200()
    {
        var game = await SetupActiveGame();

        await MarkSquare(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 0, 0);
        var response = await UnmarkSquare(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 0, 0);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task UnmarkSquare_WhenSquareIsNotMarked_Returns409()
    {
        var game = await SetupActiveGame();

        var response = await UnmarkSquare(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 0, 0);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task UnmarkSquare_OnFreeSpace_Returns409()
    {
        // 3x3 center (1,1) is free space and already marked
        var game = await SetupActiveGame(matrixSize: 3);

        var response = await UnmarkSquare(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 1, 1);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    #endregion

    #region Win Revocation

    [Fact]
    public async Task UnmarkSquare_WinningSquare_RevokesWinAndRemovesLeaderboardEntry()
    {
        var game = await SetupActiveGame(matrixSize: 3);

        // Win via row 0
        await MarkRow(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 0, matrixSize: 3);

        // Unmark a winning square
        var response = await UnmarkSquare(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 0, 1);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await Deserialize<UnmarkSquareApiResponse>(response);
        Assert.True(body.WinRevoked);

        // Verify leaderboard is empty and hasWon is false
        var stateResponse = await GetRoomState(game.RoomId, game.Host.PlayerToken);
        var state = await Deserialize<RoomStateResponse>(stateResponse);
        Assert.Empty(state.Leaderboard);

        var host = state.Players.Single(p => p.PlayerId == game.Host.PlayerId);
        Assert.False(host.HasWon);
    }

    [Fact]
    public async Task UnmarkSquare_NonWinningSquare_AfterWin_PreservesWin()
    {
        var game = await SetupActiveGame(matrixSize: 3);

        // Win via row 0, then mark (2,0) which is not in row 0
        await MarkRow(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 0, matrixSize: 3);
        await MarkSquare(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 2, 0);

        // Unmark (2,0) which is not part of the winning row
        var response = await UnmarkSquare(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 2, 0);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await Deserialize<UnmarkSquareApiResponse>(response);
        Assert.False(body.WinRevoked);

        var leaderboard = await GetLeaderboard(game.RoomId, game.Host.PlayerToken);
        Assert.Single(leaderboard);
    }

    [Fact]
    public async Task UnmarkSquare_WinRevocation_RecomputesRanks()
    {
        var game = await SetupActiveGame(matrixSize: 3, playerCount: 2);
        var player2 = game.Players[0];

        // Host wins first (rank 1) via row 0
        await MarkRow(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 0, matrixSize: 3);

        // Player2 wins second (rank 2) via row 0
        await MarkRow(game.RoomId, player2.PlayerId, player2.PlayerToken, 0, matrixSize: 3);

        var leaderboard = await GetLeaderboard(game.RoomId, game.Host.PlayerToken);
        Assert.Equal(2, leaderboard.Count);

        // Revoke host's win by unmarking a winning square
        var unmarkResponse = await UnmarkSquare(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 0, 0);
        Assert.Equal(HttpStatusCode.OK, unmarkResponse.StatusCode);

        var unmarkBody = await Deserialize<UnmarkSquareApiResponse>(unmarkResponse);
        Assert.True(unmarkBody.WinRevoked);

        // Player2 should now be rank 1
        leaderboard = await GetLeaderboard(game.RoomId, game.Host.PlayerToken);
        Assert.Single(leaderboard);
        Assert.Equal(player2.PlayerId, leaderboard[0].PlayerId);
        Assert.Equal(1, leaderboard[0].Rank);
    }

    #endregion

    #region Re-Winning

    [Fact]
    public async Task MarkSquare_AfterRevocation_CanWinAgainWithNewPattern()
    {
        var game = await SetupActiveGameWithPatterns(["Row", "Column"], matrixSize: 3);

        // Win via row 0
        await MarkRow(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 0, matrixSize: 3);

        // Unmark (0,1) to revoke the row win
        await UnmarkSquare(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 0, 1);

        // Now complete column 0: already have (0,0), need (2,0). (1,0) is already marked from row attempt? No, row 0 only marks row 0.
        // We have (0,0) and (0,2) marked from the original row marks. Need col 0: (0,0) is marked, need (2,0).
        // But we also need (1,0) for col 0 (since center is (1,1), col 0 row 1 is not free).
        await MarkSquare(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 1, 0);
        var lastMark = await MarkSquare(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 2, 0);

        var body = await Deserialize<MarkSquareApiResponse>(lastMark);
        Assert.NotNull(body.Bingo);
        Assert.Equal("Column", body.Bingo.Pattern);

        var leaderboard = await GetLeaderboard(game.RoomId, game.Host.PlayerToken);
        var entry = Assert.Single(leaderboard);
        Assert.Equal("Column", entry.WinningPattern);
        Assert.All(entry.WinningSquares, s => Assert.Equal(0, s.Column));
    }

    [Fact]
    public async Task MarkSquare_AfterRevocation_CanWinAgainWithSamePattern()
    {
        var game = await SetupActiveGame(matrixSize: 3);

        // Win via row 0
        await MarkRow(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 0, matrixSize: 3);

        // Unmark (0,1) to revoke
        await UnmarkSquare(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 0, 1);

        var leaderboard = await GetLeaderboard(game.RoomId, game.Host.PlayerToken);
        Assert.Empty(leaderboard);

        // Re-mark (0,1) to win again with the same pattern
        var response = await MarkSquare(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 0, 1);
        var body = await Deserialize<MarkSquareApiResponse>(response);
        Assert.NotNull(body.Bingo);
        Assert.Equal("Row", body.Bingo.Pattern);

        leaderboard = await GetLeaderboard(game.RoomId, game.Host.PlayerToken);
        Assert.Single(leaderboard);
    }

    #endregion
}
