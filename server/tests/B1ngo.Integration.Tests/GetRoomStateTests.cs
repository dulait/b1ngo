using System.Net;

namespace B1ngo.Integration.Tests;

[Collection("Integration")]
public sealed class GetRoomStateTests(B1ngoApiFactory factory) : IntegrationTestBase(factory)
{
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

        var response = await GetRoomState(fakeRoomId, room.PlayerToken);

        // Token is valid but for a different room, so it returns 403
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task GetRoomState_AsNonHostPlayer_OwnCardVisible()
    {
        var room = await CreateRoom();
        var player2 = await JoinRoom(room.JoinCode, "Player2");

        var response = await GetRoomState(room.RoomId, player2.PlayerToken);
        var state = await Deserialize<RoomStateResponse>(response);

        var self = state.Players.Single(p => p.PlayerId == player2.PlayerId);
        Assert.NotNull(self.Card);
        Assert.NotEmpty(self.Card.Squares);

        var host = state.Players.Single(p => p.PlayerId == room.PlayerId);
        Assert.Null(host.Card);
    }

    [Fact]
    public async Task GetRoomState_AsNonHostPlayer_OtherPlayersCardIsNull()
    {
        var room = await CreateRoom();
        var player2 = await JoinRoom(room.JoinCode, "Player2");
        var player3 = await JoinRoom(room.JoinCode, "Player3");

        var response = await GetRoomState(room.RoomId, player2.PlayerToken);
        var state = await Deserialize<RoomStateResponse>(response);

        // Player2 sees own card
        var self = state.Players.Single(p => p.PlayerId == player2.PlayerId);
        Assert.NotNull(self.Card);

        // Player3 card is null (from Player2's perspective)
        var other = state.Players.Single(p => p.PlayerId == player3.PlayerId);
        Assert.Null(other.Card);

        // Host card is null
        var host = state.Players.Single(p => p.PlayerId == room.PlayerId);
        Assert.Null(host.Card);
    }

    [Fact]
    public async Task GetRoomState_AsHost_AllCardsVisible()
    {
        var room = await CreateRoom();
        var player2 = await JoinRoom(room.JoinCode, "Player2");

        var response = await GetRoomState(room.RoomId, room.PlayerToken);
        var state = await Deserialize<RoomStateResponse>(response);

        Assert.All(state.Players, p => Assert.NotNull(p.Card));
    }

    [Fact]
    public async Task GetRoomState_AfterWin_LeaderboardIncludesWinningSquares()
    {
        var game = await SetupActiveGame(matrixSize: 3);

        await MarkRow(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 0, matrixSize: 3);

        var response = await GetRoomState(game.RoomId, game.Host.PlayerToken);
        var state = await Deserialize<RoomStateResponse>(response);

        var entry = Assert.Single(state.Leaderboard);
        Assert.Equal("Row", entry.WinningPattern);
        Assert.Equal(3, entry.WinningSquares.Count);
        Assert.Contains(entry.WinningSquares, s => s.Row == 0 && s.Column == 0);
        Assert.Contains(entry.WinningSquares, s => s.Row == 0 && s.Column == 1);
        Assert.Contains(entry.WinningSquares, s => s.Row == 0 && s.Column == 2);
    }

    [Fact]
    public async Task GetRoomState_CompletedRoom_ReturnsFullFinalState()
    {
        var game = await SetupActiveGame(matrixSize: 3);

        await MarkRow(game.RoomId, game.Host.PlayerId, game.Host.PlayerToken, 0, matrixSize: 3);
        await EndGame(game.RoomId, game.Host.PlayerToken);

        var response = await GetRoomState(game.RoomId, game.Host.PlayerToken);
        var state = await Deserialize<RoomStateResponse>(response);

        Assert.Equal("Completed", state.Status);
        Assert.Single(state.Leaderboard);

        var host = state.Players.Single(p => p.PlayerId == game.Host.PlayerId);
        Assert.True(host.HasWon);
    }
}
