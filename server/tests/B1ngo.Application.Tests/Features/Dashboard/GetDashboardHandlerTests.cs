using B1ngo.Application.Common.Ports;
using B1ngo.Application.Features.Dashboard;
using B1ngo.Application.Tests.Fakes;

namespace B1ngo.Application.Tests.Features.Dashboard;

public class GetDashboardHandlerTests
{
    private readonly FakeUserActivityRepository _repository = new();
    private readonly GetDashboardHandler _sut;

    public GetDashboardHandlerTests()
    {
        _sut = new GetDashboardHandler(_repository);
    }

    private static GetDashboardQuery ValidQuery => new(Guid.NewGuid());

    [Fact]
    public async Task HandleAsync_WithActiveRooms_ReturnsCappedAt5WithTotalCount()
    {
        var userId = Guid.NewGuid();
        _repository.SeedDisplayName("TestPlayer");
        _repository.SeedActiveRooms(
            CreateActiveRoom("GP 1"),
            CreateActiveRoom("GP 2"),
            CreateActiveRoom("GP 3"),
            CreateActiveRoom("GP 4"),
            CreateActiveRoom("GP 5"),
            CreateActiveRoom("GP 6"),
            CreateActiveRoom("GP 7")
        );
        _repository.SeedQuickStats(new QuickStatsRecord(10, 3));

        var result = await _sut.HandleAsync(new GetDashboardQuery(userId));

        Assert.True(result.IsSuccess);
        Assert.Equal("TestPlayer", result.Value.DisplayName);
        Assert.Equal(5, result.Value.ActiveRooms.Count);
        Assert.Equal(7, result.Value.TotalActiveRooms);
    }

    [Fact]
    public async Task HandleAsync_WithNoGamesPlayed_ReturnsZeroWinRate()
    {
        _repository.SeedQuickStats(new QuickStatsRecord(0, 0));

        var result = await _sut.HandleAsync(ValidQuery);

        Assert.True(result.IsSuccess);
        Assert.Equal(0, result.Value.QuickStats.GamesPlayed);
        Assert.Equal(0, result.Value.QuickStats.Wins);
        Assert.Equal(0m, result.Value.QuickStats.WinRate);
    }

    [Fact]
    public async Task HandleAsync_WithGamesPlayed_ComputesWinRateRoundedTo4Decimals()
    {
        _repository.SeedQuickStats(new QuickStatsRecord(3, 1));

        var result = await _sut.HandleAsync(ValidQuery);

        Assert.True(result.IsSuccess);
        Assert.Equal(3, result.Value.QuickStats.GamesPlayed);
        Assert.Equal(1, result.Value.QuickStats.Wins);
        Assert.Equal(0.3333m, result.Value.QuickStats.WinRate);
    }

    [Fact]
    public async Task HandleAsync_WithNoActiveRooms_ReturnsEmptyList()
    {
        _repository.SeedQuickStats(new QuickStatsRecord(5, 2));

        var result = await _sut.HandleAsync(ValidQuery);

        Assert.True(result.IsSuccess);
        Assert.Empty(result.Value.ActiveRooms);
        Assert.Equal(0, result.Value.TotalActiveRooms);
    }

    private static UserActiveRoomRecord CreateActiveRoom(string gpName) =>
        new(
            RoomId: Guid.NewGuid(),
            PlayerId: Guid.NewGuid(),
            GpName: gpName,
            SessionType: "Race",
            PlayerCount: 4,
            Status: "Active",
            IsHost: false,
            JoinedAt: DateTimeOffset.UtcNow
        );
}
