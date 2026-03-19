using System.Net;

namespace B1ngo.Integration.Tests;

[Collection("Integration")]
public sealed class EditSquareTests(B1ngoApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task EditSquare_WithValidData_Returns200WithUpdatedSquare()
    {
        var room = await CreateRoom();

        var response = await EditSquare(room.RoomId, room.PlayerToken, 0, 0, "My Custom Event");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await Deserialize<EditSquareDto>(response);
        Assert.Equal(0, body.Row);
        Assert.Equal(0, body.Column);
        Assert.Equal("My Custom Event", body.DisplayText);
    }

    [Fact]
    public async Task EditSquare_WithNoToken_Returns401()
    {
        var room = await CreateRoom();

        using var client = Factory.CreateClient();
        var response = await client.PutAsJsonAsync(
            $"/api/v1/rooms/{room.RoomId}/players/me/card/squares/0/0",
            new { displayText = "Test" }
        );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task EditSquare_WhenRoomIsActive_Returns409()
    {
        var room = await CreateRoom();
        await StartGame(room.RoomId, room.PlayerToken);

        var response = await EditSquare(room.RoomId, room.PlayerToken, 0, 0, "Test");

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task EditSquare_WithTextTooLong_Returns400()
    {
        var room = await CreateRoom();

        var response = await EditSquare(room.RoomId, room.PlayerToken, 0, 0, new string('X', 201));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task EditSquare_WithHtmlInText_Returns400()
    {
        var room = await CreateRoom();

        var response = await EditSquare(room.RoomId, room.PlayerToken, 0, 0, "<script>alert(1)</script>");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task EditSquare_OnFreeSpace_Returns409()
    {
        // On a 3x3 card, center (1,1) is the free space
        var room = await CreateRoom(matrixSize: 3);

        var response = await EditSquare(room.RoomId, room.PlayerToken, 1, 1, "Custom");

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    private record EditSquareDto(int Row, int Column, string DisplayText, string? EventKey);
}

internal static class HttpClientJsonExtensions
{
    public static Task<HttpResponseMessage> PutAsJsonAsync<T>(this HttpClient client, string requestUri, T value)
    {
        return client.PutAsync(requestUri, System.Net.Http.Json.JsonContent.Create(value));
    }
}
