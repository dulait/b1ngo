using B1ngo.Application.Common.Results;
using B1ngo.Application.Features.Rooms.Reconnect;
using B1ngo.Application.Tests.Fakes;
using B1ngo.Domain.Game;

namespace B1ngo.Application.Tests.Features.Rooms.Reconnect;

public class ReconnectHandlerTests
{
    private readonly FakeRoomRepository _roomRepository = new();
    private readonly ReconnectHandler _sut;

    public ReconnectHandlerTests()
    {
        _sut = new ReconnectHandler(_roomRepository);
    }

    [Fact]
    public async Task HandleAsync_RoomExists_ReturnsSuccess()
    {
        var session = new RaceSession(2026, "Bahrain Grand Prix", SessionType.Race);
        var room = Room.Create("Host", session);
        _roomRepository.Seed(room);
        var host = room.GetHost();
        var query = new ReconnectQuery(room.Id.Value, host.Id.Value);

        var result = await _sut.HandleAsync(query);

        Assert.True(result.IsSuccess);
        Assert.Equal(room.Id.Value, result.Value.RoomId);
        Assert.Equal(host.Id.Value, result.Value.PlayerId);
        Assert.Equal("Lobby", result.Value.RoomStatus);
    }

    [Fact]
    public async Task HandleAsync_RoomDoesNotExist_ReturnsNotFoundError()
    {
        var query = new ReconnectQuery(Guid.NewGuid(), Guid.NewGuid());

        var result = await _sut.HandleAsync(query);

        Assert.True(result.IsFailure);
        Assert.Equal(ErrorType.NotFound, result.Error!.Type);
    }
}
