using B1ngo.Application.Common.Ports;
using B1ngo.Application.Features.History;
using B1ngo.Application.Tests.Fakes;

namespace B1ngo.Application.Tests.Features.History;

public class GetHistoryHandlerTests
{
    private readonly FakeUserActivityRepository _repository = new();
    private readonly GetHistoryHandler _sut;

    public GetHistoryHandlerTests()
    {
        _sut = new GetHistoryHandler(_repository);
    }

    private static GetHistoryQuery ValidQuery => new(Guid.NewGuid());

    [Fact]
    public async Task HandleAsync_WithRooms_ReturnsActiveAndPaginatedCompleted()
    {
        var userId = Guid.NewGuid();
        _repository.SeedActiveRooms(CreateActiveRoom("GP Active"));
        _repository.SeedCompletedRooms(
            CreateCompletedRoom("GP 1"),
            CreateCompletedRoom("GP 2"),
            CreateCompletedRoom("GP 3")
        );

        var result = await _sut.HandleAsync(new GetHistoryQuery(userId, Page: 1, PageSize: 2));

        Assert.True(result.IsSuccess);
        Assert.Single(result.Value.ActiveRooms);
        Assert.Equal(2, result.Value.CompletedRooms.Items.Count);
        Assert.Equal(3, result.Value.CompletedRooms.TotalCount);
        Assert.Equal(2, result.Value.CompletedRooms.TotalPages);
        Assert.True(result.Value.CompletedRooms.HasNextPage);
    }

    [Fact]
    public async Task HandleAsync_WithPageAndPageSize_PassesThroughCorrectly()
    {
        _repository.SeedCompletedRooms(
            CreateCompletedRoom("GP 1"),
            CreateCompletedRoom("GP 2"),
            CreateCompletedRoom("GP 3")
        );

        var result = await _sut.HandleAsync(new GetHistoryQuery(Guid.NewGuid(), Page: 2, PageSize: 2));

        Assert.True(result.IsSuccess);
        Assert.Single(result.Value.CompletedRooms.Items);
        Assert.Equal(2, result.Value.CompletedRooms.Page);
        Assert.Equal(2, result.Value.CompletedRooms.PageSize);
        Assert.False(result.Value.CompletedRooms.HasNextPage);
    }

    [Fact]
    public async Task HandleAsync_WithNoRooms_ReturnsEmptyLists()
    {
        var result = await _sut.HandleAsync(ValidQuery);

        Assert.True(result.IsSuccess);
        Assert.Empty(result.Value.ActiveRooms);
        Assert.Empty(result.Value.CompletedRooms.Items);
        Assert.Equal(0, result.Value.CompletedRooms.TotalCount);
    }

    [Fact]
    public async Task HandleAsync_WithCompletedRoom_MapsFieldsIncludingNullables()
    {
        var roomId = Guid.NewGuid();
        _repository.SeedCompletedRooms(
            new UserCompletedRoomRecord(
                RoomId: roomId,
                GpName: "Monaco Grand Prix",
                SessionType: "Qualifying",
                PlayerCount: 8,
                CompletedAt: new DateTimeOffset(2026, 5, 24, 14, 0, 0, TimeSpan.Zero),
                ResultRank: 2,
                WinPattern: "Row"
            ),
            new UserCompletedRoomRecord(
                RoomId: Guid.NewGuid(),
                GpName: "Spa Grand Prix",
                SessionType: "Race",
                PlayerCount: 3,
                CompletedAt: DateTimeOffset.UtcNow,
                ResultRank: null,
                WinPattern: null
            )
        );

        var result = await _sut.HandleAsync(new GetHistoryQuery(Guid.NewGuid(), Page: 1, PageSize: 10));

        Assert.True(result.IsSuccess);
        var first = result.Value.CompletedRooms.Items[0];
        Assert.Equal(roomId, first.RoomId);
        Assert.Equal("Monaco Grand Prix", first.GpName);
        Assert.Equal("Qualifying", first.SessionType);
        Assert.Equal(8, first.PlayerCount);
        Assert.Equal(2, first.ResultRank);
        Assert.Equal("Row", first.WinPattern);

        var second = result.Value.CompletedRooms.Items[1];
        Assert.Null(second.ResultRank);
        Assert.Null(second.WinPattern);
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

    private static UserCompletedRoomRecord CreateCompletedRoom(string gpName) =>
        new(
            RoomId: Guid.NewGuid(),
            GpName: gpName,
            SessionType: "Race",
            PlayerCount: 4,
            CompletedAt: DateTimeOffset.UtcNow,
            ResultRank: 1,
            WinPattern: "Row"
        );
}
