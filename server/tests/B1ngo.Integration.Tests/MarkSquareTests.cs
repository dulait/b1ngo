using System.Net;

namespace B1ngo.Integration.Tests;

[Collection("Integration")]
public sealed class MarkSquareTests(B1ngoApiFactory factory) : IntegrationTestBase(factory)
{
    #region Basic

    [Fact]
    public async Task MarkSquare_WithValidData_Returns200()
    {
        var game = await SetupActiveGame();

        var response = await MarkSquare(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 0, 0);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task MarkSquare_WithNoToken_Returns401()
    {
        var game = await SetupActiveGame();

        using var client = Factory.CreateClient();
        var response = await client.PostAsync(
            $"/api/v1/rooms/{game.RoomId}/players/{game.Host.PlayerId}/card/squares/0/0/mark",
            null
        );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task MarkSquare_WhenRoomIsInLobby_Returns409()
    {
        var room = await CreateRoom();

        var response = await MarkSquare(room.RoomId, room.PlayerId, room.PlayerToken, 0, 0);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task MarkSquare_OnAlreadyMarkedSquare_Returns409()
    {
        var game = await SetupActiveGame();

        await MarkSquare(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 0, 0);
        var response = await MarkSquare(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 0, 0);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task MarkSquare_OnFreeSpace_Returns409()
    {
        // 3x3 center is (1,1)
        var game = await SetupActiveGame(matrixSize: 3);

        var response = await MarkSquare(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 1, 1);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task MarkSquare_AsWrongPlayer_Returns403()
    {
        var game = await SetupActiveGame(playerCount: 2);
        var player2 = game.Players[0];

        // Player2's token, but host's playerId
        var response = await MarkSquare(game.RoomId, game.Host.PlayerId, player2.PlayerToken, 0, 0);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task MarkSquare_HostMarksPlayerSquare_Returns200()
    {
        var game = await SetupActiveGame(playerCount: 2);
        var player2 = game.Players[0];

        // Host marks a square on Player2's card
        var response = await MarkSquare(game.RoomId, player2.PlayerId, game.Host.PlayerToken, 0, 0);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await Deserialize<MarkSquareApiResponse>(response);
        Assert.Equal("Host", body.MarkedBy);
    }

    #endregion

    #region Win Detection (3x3)

    [Fact]
    public async Task MarkSquare_CompletesRow_ReturnsWinWithRowPatternAndCoordinates()
    {
        var game = await SetupActiveGame(matrixSize: 3);

        var lastMark = await MarkRow(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 0, matrixSize: 3);

        Assert.Equal(HttpStatusCode.OK, lastMark.StatusCode);
        var body = await Deserialize<MarkSquareApiResponse>(lastMark);
        Assert.NotNull(body.Bingo);
        Assert.Equal("Row", body.Bingo.Pattern);
        Assert.Equal(1, body.Bingo.Rank);

        var leaderboard = await GetLeaderboard(game.RoomId, game.Host.PlayerToken);
        var entry = Assert.Single(leaderboard);
        Assert.Equal("Row", entry.WinningPattern);
        Assert.Equal(3, entry.WinningSquares.Count);
        Assert.All(entry.WinningSquares, s => Assert.Equal(0, s.Row));
    }

    [Fact]
    public async Task MarkSquare_CompletesColumn_ReturnsWinWithColumnPatternAndCoordinates()
    {
        var game = await SetupActiveGame(matrixSize: 3);

        var lastMark = await MarkColumn(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 0, matrixSize: 3);

        Assert.Equal(HttpStatusCode.OK, lastMark.StatusCode);
        var body = await Deserialize<MarkSquareApiResponse>(lastMark);
        Assert.NotNull(body.Bingo);
        Assert.Equal("Column", body.Bingo.Pattern);

        var leaderboard = await GetLeaderboard(game.RoomId, game.Host.PlayerToken);
        var entry = Assert.Single(leaderboard);
        Assert.Equal(3, entry.WinningSquares.Count);
        Assert.All(entry.WinningSquares, s => Assert.Equal(0, s.Column));
    }

    [Fact]
    public async Task MarkSquare_CompletesMainDiagonal_ReturnsWinWithDiagonalPatternAndCoordinates()
    {
        var game = await SetupActiveGame(matrixSize: 3);

        var lastMark = await MarkMainDiagonal(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, matrixSize: 3);

        Assert.Equal(HttpStatusCode.OK, lastMark.StatusCode);
        var body = await Deserialize<MarkSquareApiResponse>(lastMark);
        Assert.NotNull(body.Bingo);
        Assert.Equal("Diagonal", body.Bingo.Pattern);

        var leaderboard = await GetLeaderboard(game.RoomId, game.Host.PlayerToken);
        var entry = Assert.Single(leaderboard);
        Assert.Equal(3, entry.WinningSquares.Count);
        // Main diagonal: (0,0), (1,1), (2,2)
        Assert.Contains(entry.WinningSquares, s => s.Row == 0 && s.Column == 0);
        Assert.Contains(entry.WinningSquares, s => s.Row == 1 && s.Column == 1);
        Assert.Contains(entry.WinningSquares, s => s.Row == 2 && s.Column == 2);
    }

    [Fact]
    public async Task MarkSquare_CompletesAntiDiagonal_ReturnsWinWithDiagonalPatternAndCoordinates()
    {
        var game = await SetupActiveGame(matrixSize: 3);

        var lastMark = await MarkAntiDiagonal(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, matrixSize: 3);

        Assert.Equal(HttpStatusCode.OK, lastMark.StatusCode);
        var body = await Deserialize<MarkSquareApiResponse>(lastMark);
        Assert.NotNull(body.Bingo);
        Assert.Equal("Diagonal", body.Bingo.Pattern);

        var leaderboard = await GetLeaderboard(game.RoomId, game.Host.PlayerToken);
        var entry = Assert.Single(leaderboard);
        Assert.Equal(3, entry.WinningSquares.Count);
        // Anti-diagonal: (0,2), (1,1), (2,0)
        Assert.Contains(entry.WinningSquares, s => s.Row == 0 && s.Column == 2);
        Assert.Contains(entry.WinningSquares, s => s.Row == 1 && s.Column == 1);
        Assert.Contains(entry.WinningSquares, s => s.Row == 2 && s.Column == 0);
    }

    [Fact]
    public async Task MarkSquare_CompletesBlackout_ReturnsWinWithBlackoutPatternAndAllCoordinates()
    {
        var game = await SetupActiveGameWithPatterns(["Blackout"], matrixSize: 3);

        var lastMark = await MarkAllNonFreeSquares(
            game.RoomId,
            game.Host.PlayerId,
            game.Host.PlayerToken,
            matrixSize: 3
        );

        Assert.Equal(HttpStatusCode.OK, lastMark.StatusCode);
        var body = await Deserialize<MarkSquareApiResponse>(lastMark);
        Assert.NotNull(body.Bingo);
        Assert.Equal("Blackout", body.Bingo.Pattern);

        var leaderboard = await GetLeaderboard(game.RoomId, game.Host.PlayerToken);
        var entry = Assert.Single(leaderboard);
        Assert.Equal(9, entry.WinningSquares.Count);
    }

    #endregion

    #region Win Detection (5x5)

    [Fact]
    public async Task MarkSquare_5x5_CompletesRow_ReturnsWinWithCorrectCoordinates()
    {
        var game = await SetupActiveGame(matrixSize: 5);

        var lastMark = await MarkRow(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 2, matrixSize: 5);

        Assert.Equal(HttpStatusCode.OK, lastMark.StatusCode);
        var body = await Deserialize<MarkSquareApiResponse>(lastMark);
        Assert.NotNull(body.Bingo);
        Assert.Equal("Row", body.Bingo.Pattern);

        var leaderboard = await GetLeaderboard(game.RoomId, game.Host.PlayerToken);
        var entry = Assert.Single(leaderboard);
        Assert.Equal(5, entry.WinningSquares.Count);
        Assert.All(entry.WinningSquares, s => Assert.Equal(2, s.Row));
    }

    [Fact]
    public async Task MarkSquare_5x5_CompletesColumn_ReturnsWinWithCorrectCoordinates()
    {
        var game = await SetupActiveGame(matrixSize: 5);

        var lastMark = await MarkColumn(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 3, matrixSize: 5);

        Assert.Equal(HttpStatusCode.OK, lastMark.StatusCode);
        var body = await Deserialize<MarkSquareApiResponse>(lastMark);
        Assert.NotNull(body.Bingo);
        Assert.Equal("Column", body.Bingo.Pattern);

        var leaderboard = await GetLeaderboard(game.RoomId, game.Host.PlayerToken);
        var entry = Assert.Single(leaderboard);
        Assert.Equal(5, entry.WinningSquares.Count);
        Assert.All(entry.WinningSquares, s => Assert.Equal(3, s.Column));
    }

    [Fact]
    public async Task MarkSquare_5x5_CompletesMainDiagonal_ReturnsWinWithCorrectCoordinates()
    {
        var game = await SetupActiveGame(matrixSize: 5);

        var lastMark = await MarkMainDiagonal(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, matrixSize: 5);

        Assert.Equal(HttpStatusCode.OK, lastMark.StatusCode);
        var body = await Deserialize<MarkSquareApiResponse>(lastMark);
        Assert.NotNull(body.Bingo);
        Assert.Equal("Diagonal", body.Bingo.Pattern);

        var leaderboard = await GetLeaderboard(game.RoomId, game.Host.PlayerToken);
        var entry = Assert.Single(leaderboard);
        Assert.Equal(5, entry.WinningSquares.Count);
        for (var i = 0; i < 5; i++)
        {
            Assert.Contains(entry.WinningSquares, s => s.Row == i && s.Column == i);
        }
    }

    #endregion

    #region Post-Win Marking

    [Fact]
    public async Task MarkSquare_AfterWinning_Returns200WithoutDuplicateLeaderboardEntry()
    {
        var game = await SetupActiveGame(matrixSize: 3);

        await MarkRow(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 0, matrixSize: 3);

        // Mark another square after winning
        var response = await MarkSquare(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 2, 0);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var leaderboard = await GetLeaderboard(game.RoomId, game.Host.PlayerToken);
        Assert.Single(leaderboard);
    }

    [Fact]
    public async Task MarkSquare_AfterWinning_DoesNotReturnBingoInfo()
    {
        var game = await SetupActiveGame(matrixSize: 3);

        await MarkRow(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 0, matrixSize: 3);

        var response = await MarkSquare(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 2, 0);
        var body = await Deserialize<MarkSquareApiResponse>(response);

        Assert.Null(body.Bingo);
    }

    #endregion

    #region Win Priority

    [Fact]
    public async Task MarkSquare_WhenRowAndColumnCompletedSimultaneously_ReturnsFirstConfiguredPattern()
    {
        // Configure Row before Column. Mark a square at (0,0) that completes both row 0 and col 0.
        var game = await SetupActiveGameWithPatterns(["Row", "Column"], matrixSize: 3);

        // Mark row 0: (0,1), (0,2)
        await MarkSquare(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 0, 1);
        await MarkSquare(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 0, 2);

        // Mark col 0: (2,0), skip (1,0) because we need (0,0) to complete both
        await MarkSquare(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 2, 0);

        // Now mark (0,0) which completes both row 0 and col 0
        var response = await MarkSquare(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 0, 0);

        var body = await Deserialize<MarkSquareApiResponse>(response);
        Assert.NotNull(body.Bingo);
        Assert.Equal("Row", body.Bingo.Pattern);

        var leaderboard = await GetLeaderboard(game.RoomId, game.Host.PlayerToken);
        var entry = Assert.Single(leaderboard);
        Assert.All(entry.WinningSquares, s => Assert.Equal(0, s.Row));
    }

    #endregion
}
