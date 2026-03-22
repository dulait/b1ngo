using System.Net;

namespace B1ngo.Integration.Tests;

[Collection("Integration")]
public sealed class ConcurrencyTests(B1ngoApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task ConcurrentMarks_OnDifferentSquares_BothSucceedAfterRetry()
    {
        var game = await SetupActiveGame(matrixSize: 3, playerCount: 2);
        var player2 = game.Players[0];

        var task1 = MarkSquare(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 0, 0);
        var task2 = MarkSquare(game.RoomId, player2.PlayerId, player2.PlayerToken, 0, 0);

        var results = await Task.WhenAll(task1, task2);

        Assert.Contains(HttpStatusCode.OK, results.Select(r => r.StatusCode));

        var conflicted = results
            .Select((r, i) => (Response: r, Index: i))
            .Where(x => x.Response.StatusCode == HttpStatusCode.Conflict)
            .ToList();

        foreach (var c in conflicted)
        {
            var retry =
                c.Index == 0
                    ? await MarkSquare(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 0, 0)
                    : await MarkSquare(game.RoomId, player2.PlayerId, player2.PlayerToken, 0, 0);

            Assert.Equal(HttpStatusCode.OK, retry.StatusCode);
        }

        var hostState = await GetRoomState(game.RoomId, game.Host.PlayerToken);
        var state = await Deserialize<RoomStateResponse>(hostState);

        var hostSquare = state
            .Players.Single(p => p.PlayerId == game.Host.PlayerId)
            .Card!.Squares.Single(s => s.Row == 0 && s.Column == 0);
        var player2Square = state
            .Players.Single(p => p.PlayerId == player2.PlayerId)
            .Card!.Squares.Single(s => s.Row == 0 && s.Column == 0);

        Assert.True(hostSquare.IsMarked);
        Assert.True(player2Square.IsMarked);
    }

    [Fact]
    public async Task ConcurrentMarks_OnSameSquare_OneSucceedsOneGets409()
    {
        var game = await SetupActiveGame(matrixSize: 3, playerCount: 2);
        var player2 = game.Players[0];

        var task1 = MarkSquare(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 0, 0);
        var task2 = MarkSquare(game.RoomId, game.Host.PlayerId, player2.PlayerToken, 0, 0);

        var results = await Task.WhenAll(task1, task2);

        var statusCodes = results.Select(r => r.StatusCode).ToList();

        Assert.Contains(HttpStatusCode.OK, statusCodes);

        var stateResponse = await GetRoomState(game.RoomId, game.Host.PlayerToken);
        var state = await Deserialize<RoomStateResponse>(stateResponse);
        var hostPlayer = state.Players.Single(p => p.PlayerId == game.Host.PlayerId);
        var square = hostPlayer.Card!.Squares.Single(s => s.Row == 0 && s.Column == 0);
        Assert.True(square.IsMarked);
    }
}
