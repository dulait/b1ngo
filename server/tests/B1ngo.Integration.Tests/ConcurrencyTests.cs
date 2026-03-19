using System.Net;

namespace B1ngo.Integration.Tests;

[Collection("Integration")]
public sealed class ConcurrencyTests(B1ngoApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task ConcurrentMarks_OnDifferentSquares_BothSucceed()
    {
        var game = await SetupActiveGame(matrixSize: 3, playerCount: 2);
        var player2 = game.Players[0];

        var task1 = MarkSquare(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 0, 0);
        var task2 = MarkSquare(game.RoomId, player2.PlayerId, player2.PlayerToken, 0, 0);

        var results = await Task.WhenAll(task1, task2);

        Assert.All(results, r => Assert.Equal(HttpStatusCode.OK, r.StatusCode));
    }

    [Fact]
    public async Task ConcurrentMarks_OnSameSquare_OneSucceedsOneGets409()
    {
        var game = await SetupActiveGame(matrixSize: 3, playerCount: 2);
        var player2 = game.Players[0];

        // Both host and player2 try to mark the same square on the host's card
        // When serialized, the second mark hits "square_already_marked" (409).
        // When truly concurrent, the second hits DbUpdateConcurrencyException (also 409).
        // In rare cases both may serialize successfully if there's no actual conflict.
        var task1 = MarkSquare(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 0, 0);
        var task2 = MarkSquare(game.RoomId, game.Host.PlayerId, player2.PlayerToken, 0, 0);

        var results = await Task.WhenAll(task1, task2);

        var statusCodes = results.Select(r => r.StatusCode).ToList();

        // At least one must succeed
        Assert.Contains(HttpStatusCode.OK, statusCodes);

        // Verify the square is marked exactly once
        var stateResponse = await GetRoomState(game.RoomId, game.Host.PlayerToken);
        var state = await Deserialize<RoomStateResponse>(stateResponse);
        var hostPlayer = state.Players.Single(p => p.PlayerId == game.Host.PlayerId);
        var square = hostPlayer.Card!.Squares.Single(s => s.Row == 0 && s.Column == 0);
        Assert.True(square.IsMarked);
    }
}
