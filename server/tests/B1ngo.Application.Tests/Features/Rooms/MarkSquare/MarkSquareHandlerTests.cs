using B1ngo.Application.Features.Rooms.MarkSquare;
using B1ngo.Application.Tests.Fakes;
using B1ngo.Domain.Core;
using B1ngo.Domain.Game;

namespace B1ngo.Application.Tests.Features.Rooms.MarkSquare;

public class MarkSquareHandlerTests
{
    private static readonly RaceSession DefaultSession = new(2026, "Bahrain Grand Prix", SessionType.Race);

    private readonly FakeRoomRepository _roomRepository = new();
    private readonly FakeUnitOfWork _unitOfWork = new();
    private readonly FakeBingoCardGenerator _cardGenerator = new();
    private readonly MarkSquareHandler _sut;

    public MarkSquareHandlerTests()
    {
        _sut = new MarkSquareHandler(_roomRepository, _unitOfWork);
    }

    private Room SeedActiveRoom()
    {
        var room = Room.Create("Host", DefaultSession);
        var host = room.GetHost();
        host.AssignCard(_cardGenerator.Generate(SessionType.Race, room.Configuration.MatrixSize));
        room.StartGame();
        _roomRepository.Seed(room);
        return room;
    }

    private Room SeedActiveRoomWithPlayer()
    {
        var room = Room.Create("Host", DefaultSession);
        var host = room.GetHost();
        host.AssignCard(_cardGenerator.Generate(SessionType.Race, room.Configuration.MatrixSize));
        var player = room.AddPlayer("Alice");
        player.AssignCard(_cardGenerator.Generate(SessionType.Race, room.Configuration.MatrixSize));
        room.StartGame();
        _roomRepository.Seed(room);
        return room;
    }

    [Fact]
    public async Task HandleAsync_WithValidInputs_ReturnsSuccessResult()
    {
        var room = SeedActiveRoom();
        var host = room.GetHost();
        var command = new MarkSquareCommand(
            room.Id.Value, host.Id.Value, 0, 0, SquareMarkedBy.Player);

        var result = await _sut.HandleAsync(command);

        Assert.True(result.IsSuccess);
    }

    [Fact]
    public async Task HandleAsync_WithValidInputs_ReturnsMarkedSquare()
    {
        var room = SeedActiveRoom();
        var host = room.GetHost();
        var command = new MarkSquareCommand(
            room.Id.Value, host.Id.Value, 0, 0, SquareMarkedBy.Player);

        var result = await _sut.HandleAsync(command);

        Assert.Equal(0, result.Value.Row);
        Assert.Equal(0, result.Value.Column);
        Assert.True(result.Value.IsMarked);
        Assert.Equal("Player", result.Value.MarkedBy);
        Assert.NotEqual(default, result.Value.MarkedAt);
        Assert.Null(result.Value.Bingo);
    }

    [Fact]
    public async Task HandleAsync_WithHostMarkingPlayer_ReturnsHostAsMarkedBy()
    {
        var room = SeedActiveRoomWithPlayer();
        var player = room.Players[1];
        var command = new MarkSquareCommand(
            room.Id.Value, player.Id.Value, 0, 0, SquareMarkedBy.Host);

        var result = await _sut.HandleAsync(command);

        Assert.Equal("Host", result.Value.MarkedBy);
    }

    [Fact]
    public async Task HandleAsync_WithValidInputs_SavesChanges()
    {
        var room = SeedActiveRoom();
        var host = room.GetHost();
        var command = new MarkSquareCommand(
            room.Id.Value, host.Id.Value, 0, 0, SquareMarkedBy.Player);

        await _sut.HandleAsync(command);

        Assert.Equal(1, _unitOfWork.SaveChangesCallCount);
    }

    [Fact]
    public async Task HandleAsync_WithNonExistentRoom_ReturnsNotFoundError()
    {
        var command = new MarkSquareCommand(
            Guid.NewGuid(), Guid.NewGuid(), 0, 0, SquareMarkedBy.Player);

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
        _roomRepository.Seed(room); // room is in Lobby, not Active

        var command = new MarkSquareCommand(
            room.Id.Value, host.Id.Value, 0, 0, SquareMarkedBy.Player);

        var ex = await Assert.ThrowsAsync<DomainConflictException>(
            () => _sut.HandleAsync(command));
        Assert.Equal("room_not_active", ex.Code);
    }

    [Fact]
    public async Task HandleAsync_WhenSquareAlreadyMarked_ThrowsDomainConflictException()
    {
        var room = SeedActiveRoom();
        var host = room.GetHost();
        room.MarkSquare(host.Id, 0, 0, SquareMarkedBy.Player, DateTimeOffset.UtcNow);

        var command = new MarkSquareCommand(
            room.Id.Value, host.Id.Value, 0, 0, SquareMarkedBy.Player);

        var ex = await Assert.ThrowsAsync<DomainConflictException>(
            () => _sut.HandleAsync(command));
        Assert.Equal("square_already_marked", ex.Code);
    }

    [Fact]
    public async Task HandleAsync_WhenMarkingFreeSpace_ThrowsDomainConflictException()
    {
        var room = SeedActiveRoom();
        var host = room.GetHost();
        var center = room.Configuration.MatrixSize / 2;

        var command = new MarkSquareCommand(
            room.Id.Value, host.Id.Value, center, center, SquareMarkedBy.Player);

        var ex = await Assert.ThrowsAsync<DomainConflictException>(
            () => _sut.HandleAsync(command));
        Assert.Equal("square_is_free_space", ex.Code);
    }

    [Fact]
    public async Task HandleAsync_WithNonExistentRoom_DoesNotSave()
    {
        var command = new MarkSquareCommand(
            Guid.NewGuid(), Guid.NewGuid(), 0, 0, SquareMarkedBy.Player);

        await _sut.HandleAsync(command);

        Assert.Equal(0, _unitOfWork.SaveChangesCallCount);
    }
}
