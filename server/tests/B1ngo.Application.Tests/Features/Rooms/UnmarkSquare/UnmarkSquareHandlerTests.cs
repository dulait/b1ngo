using B1ngo.Application.Features.Rooms.UnmarkSquare;
using B1ngo.Application.Tests.Fakes;
using B1ngo.Domain.Core;
using B1ngo.Domain.Game;

namespace B1ngo.Application.Tests.Features.Rooms.UnmarkSquare;

public class UnmarkSquareHandlerTests
{
    private static readonly RaceSession DefaultSession = new(2026, "Bahrain Grand Prix", SessionType.Race);

    private readonly FakeRoomRepository _roomRepository = new();
    private readonly FakeUnitOfWork _unitOfWork = new();
    private readonly FakeBingoCardGenerator _cardGenerator = new();
    private readonly UnmarkSquareHandler _sut;

    public UnmarkSquareHandlerTests()
    {
        _sut = new UnmarkSquareHandler(_roomRepository, _unitOfWork);
    }

    private Room SeedActiveRoomWithMarkedSquare()
    {
        var room = Room.Create("Host", DefaultSession);
        var host = room.GetHost();
        host.AssignCard(_cardGenerator.Generate(SessionType.Race, room.Configuration.MatrixSize));
        room.StartGame();
        room.MarkSquare(host.Id, 0, 0, SquareMarkedBy.Player, DateTimeOffset.UtcNow);
        _roomRepository.Seed(room);
        return room;
    }

    [Fact]
    public async Task HandleAsync_WithValidInputs_ReturnsSuccessResult()
    {
        var room = SeedActiveRoomWithMarkedSquare();
        var host = room.GetHost();
        var command = new UnmarkSquareCommand(room.Id.Value, host.Id.Value, 0, 0);

        var result = await _sut.HandleAsync(command);

        Assert.True(result.IsSuccess);
    }

    [Fact]
    public async Task HandleAsync_WithValidInputs_ReturnsUnmarkedSquare()
    {
        var room = SeedActiveRoomWithMarkedSquare();
        var host = room.GetHost();
        var command = new UnmarkSquareCommand(room.Id.Value, host.Id.Value, 0, 0);

        var result = await _sut.HandleAsync(command);

        Assert.Equal(0, result.Value.Row);
        Assert.Equal(0, result.Value.Column);
        Assert.False(result.Value.IsMarked);
        Assert.Null(result.Value.MarkedBy);
        Assert.Null(result.Value.MarkedAt);
        Assert.False(result.Value.WinRevoked);
    }

    [Fact]
    public async Task HandleAsync_WithValidInputs_SavesChanges()
    {
        var room = SeedActiveRoomWithMarkedSquare();
        var host = room.GetHost();
        var command = new UnmarkSquareCommand(room.Id.Value, host.Id.Value, 0, 0);

        await _sut.HandleAsync(command);

        Assert.Equal(1, _unitOfWork.SaveChangesCallCount);
    }

    [Fact]
    public async Task HandleAsync_WithNonExistentRoom_ReturnsNotFoundError()
    {
        var command = new UnmarkSquareCommand(Guid.NewGuid(), Guid.NewGuid(), 0, 0);

        var result = await _sut.HandleAsync(command);

        Assert.True(result.IsFailure);
        Assert.Equal("room_not_found", result.Error!.Code);
    }

    [Fact]
    public async Task HandleAsync_WhenRoomNotActive_ThrowsDomainConflictException()
    {
        var room = Room.Create("Host", DefaultSession);
        var host = room.GetHost();
        host.AssignCard(_cardGenerator.Generate(SessionType.Race, room.Configuration.MatrixSize));
        _roomRepository.Seed(room);

        var command = new UnmarkSquareCommand(room.Id.Value, host.Id.Value, 0, 0);

        var ex = await Assert.ThrowsAsync<DomainConflictException>(
            () => _sut.HandleAsync(command));
        Assert.Equal("room_not_active", ex.Code);
    }

    [Fact]
    public async Task HandleAsync_WhenSquareNotMarked_ThrowsDomainConflictException()
    {
        var room = Room.Create("Host", DefaultSession);
        var host = room.GetHost();
        host.AssignCard(_cardGenerator.Generate(SessionType.Race, room.Configuration.MatrixSize));
        room.StartGame();
        _roomRepository.Seed(room);

        var command = new UnmarkSquareCommand(room.Id.Value, host.Id.Value, 0, 0);

        var ex = await Assert.ThrowsAsync<DomainConflictException>(
            () => _sut.HandleAsync(command));
        Assert.Equal("square_not_marked", ex.Code);
    }

    [Fact]
    public async Task HandleAsync_WithNonExistentRoom_DoesNotSave()
    {
        var command = new UnmarkSquareCommand(Guid.NewGuid(), Guid.NewGuid(), 0, 0);

        await _sut.HandleAsync(command);

        Assert.Equal(0, _unitOfWork.SaveChangesCallCount);
    }
}
