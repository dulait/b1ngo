using System.Net;
using System.Net.Http.Json;

namespace B1ngo.Integration.Tests;

[Collection("Integration")]
public sealed class CreateRoomTests(B1ngoApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task CreateRoom_WithEmptyHostDisplayName_Returns400()
    {
        using var client = Factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/v1/rooms", new
        {
            hostDisplayName = "",
            season = 2026,
            grandPrixName = "Monaco",
            sessionType = 6,
            matrixSize = 3,
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateRoom_WithEvenMatrixSize_Returns400()
    {
        using var client = Factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/v1/rooms", new
        {
            hostDisplayName = "Host",
            season = 2026,
            grandPrixName = "Monaco",
            sessionType = 6,
            matrixSize = 4,
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateRoom_WithValidData_ReturnsRoomIdJoinCodeAndPlayerId()
    {
        var room = await CreateRoom();

        Assert.NotEqual(Guid.Empty, room.RoomId);
        Assert.NotEmpty(room.JoinCode);
        Assert.NotEqual(Guid.Empty, room.PlayerId);
        Assert.NotEqual(Guid.Empty, room.PlayerToken);
    }
}
