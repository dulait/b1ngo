using System.Net;
using System.Net.Http.Json;

namespace B1ngo.Integration.Tests;

[Collection("Integration")]
public sealed class CreateRoomTests(B1ngoApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task CreateRoom_WithValidData_ReturnsRoomIdJoinCodeAndPlayerId()
    {
        var room = await CreateRoom();

        Assert.NotEqual(Guid.Empty, room.RoomId);
        Assert.NotEmpty(room.JoinCode);
        Assert.NotEqual(Guid.Empty, room.PlayerId);
        Assert.NotEqual(Guid.Empty, room.PlayerToken);
    }

    [Fact]
    public async Task CreateRoom_WithCustomMatrixAndPatterns_ReturnsRoom()
    {
        var room = await CreateRoomWithPatterns(["Row", "Blackout"], matrixSize: 3);

        Assert.NotEqual(Guid.Empty, room.RoomId);

        var state = await GetRoomState(room.RoomId, room.PlayerToken);
        var body = await Deserialize<RoomStateResponse>(state);
        Assert.Equal(3, body.Configuration.MatrixSize);
        Assert.Contains("Row", body.Configuration.WinningPatterns);
        Assert.Contains("Blackout", body.Configuration.WinningPatterns);
    }

    [Fact]
    public async Task CreateRoom_WithEmptyHostDisplayName_Returns400()
    {
        var response = await CreateRoomRaw(
            new
            {
                hostDisplayName = "",
                season = TestSeason,
                grandPrixName = TestGrandPrixName,
                sessionType = "Race",
                matrixSize = 3,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateRoom_WithNameTooLong_Returns400()
    {
        var response = await CreateRoomRaw(
            new
            {
                hostDisplayName = new string('A', 51),
                season = TestSeason,
                grandPrixName = TestGrandPrixName,
                sessionType = "Race",
                matrixSize = 3,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateRoom_WithHtmlInName_Returns400()
    {
        var response = await CreateRoomRaw(
            new
            {
                hostDisplayName = "<script>alert(1)</script>",
                season = TestSeason,
                grandPrixName = TestGrandPrixName,
                sessionType = "Race",
                matrixSize = 3,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateRoom_WithEvenMatrixSize_Returns400()
    {
        var response = await CreateRoomRaw(
            new
            {
                hostDisplayName = "Host",
                season = TestSeason,
                grandPrixName = TestGrandPrixName,
                sessionType = "Race",
                matrixSize = 4,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateRoom_WithMatrixSizeTooSmall_Returns400()
    {
        var response = await CreateRoomRaw(
            new
            {
                hostDisplayName = "Host",
                season = TestSeason,
                grandPrixName = TestGrandPrixName,
                sessionType = "Race",
                matrixSize = 1,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateRoom_WithMatrixSizeTooLarge_Returns400()
    {
        var response = await CreateRoomRaw(
            new
            {
                hostDisplayName = "Host",
                season = TestSeason,
                grandPrixName = TestGrandPrixName,
                sessionType = "Race",
                matrixSize = 11,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateRoom_WithEmptyWinningPatterns_Returns400()
    {
        var response = await CreateRoomRaw(
            new
            {
                hostDisplayName = "Host",
                season = TestSeason,
                grandPrixName = TestGrandPrixName,
                sessionType = "Race",
                matrixSize = 3,
                winningPatterns = Array.Empty<string>(),
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateRoom_WithGrandPrixNameTooLong_Returns400()
    {
        var response = await CreateRoomRaw(
            new
            {
                hostDisplayName = "Host",
                season = TestSeason,
                grandPrixName = new string('A', 101),
                sessionType = "Race",
                matrixSize = 3,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateRoom_WithHtmlInGrandPrixName_Returns400()
    {
        var response = await CreateRoomRaw(
            new
            {
                hostDisplayName = "Host",
                season = TestSeason,
                grandPrixName = "<img src=x onerror=alert(1)>",
                sessionType = "Race",
                matrixSize = 3,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateRoom_WithSessionTypeInvalidForStandardGp_Returns400()
    {
        var response = await CreateRoomRaw(
            new
            {
                hostDisplayName = "Host",
                season = TestSeason,
                grandPrixName = TestGrandPrixName,
                sessionType = "Sprint",
                matrixSize = 3,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("session_type_invalid_for_gp", body);
    }

    [Fact]
    public async Task CreateRoom_WithSprintSessionTypeForSprintGp_Returns200()
    {
        using var client = Factory.CreateClient();
        var response = await client.PostAsJsonAsync(
            "/api/v1/rooms",
            new
            {
                hostDisplayName = "Host",
                season = TestSeason,
                grandPrixName = TestSprintGrandPrixName,
                sessionType = "SprintQualifying",
                matrixSize = 3,
            }
        );

        response.EnsureSuccessStatusCode();
    }
}
