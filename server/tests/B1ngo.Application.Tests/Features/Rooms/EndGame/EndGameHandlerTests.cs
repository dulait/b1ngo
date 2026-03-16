using B1ngo.Application.Features.Rooms.EndGame;
using B1ngo.Application.Tests.Fakes;
using B1ngo.Domain.Core;
using B1ngo.Domain.Game;

namespace B1ngo.Application.Tests.Features.Rooms.EndGame;

public class EndGameHandlerTests
{
    private static readonly RaceSession DefaultSession = new(2026, "Bahrain Grand Prix", SessionType.Race);

    private readonly FakeRoomRepository _roomRepository = new();
    private readonly FakeUnitOfWork _unitOfWork = new();
    private readonly FakeBingoCardGenerator _cardGenerator = new();
    private readonly EndGameHandler _sut;

    public EndGameHandlerTests()
    {
        _sut = new EndGameHandler(_roomRepository, _unitOfWork);
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

    [Fact]
    public async Task HandleAsync_WithValidRoom_ReturnsSuccessResult()
    {
        var room = SeedActiveRoom();
        var command = new EndGameCommand(room.Id.Value);

        var result = await _sut.HandleAsync(command);

        Assert.True(result.IsSuccess);
    }

    [Fact]
    public async Task HandleAsync_WithValidRoom_ReturnsCompletedStatus()
    {
        var room = SeedActiveRoom();
        var command = new EndGameCommand(room.Id.Value);

        var result = await _sut.HandleAsync(command);

        Assert.Equal(room.Id.Value, result.Value.RoomId);
        Assert.Equal("Completed", result.Value.Status);
    }

    [Fact]
    public async Task HandleAsync_WithValidRoom_TransitionsRoomToCompleted()
    {
        var room = SeedActiveRoom();
        var command = new EndGameCommand(room.Id.Value);

        await _sut.HandleAsync(command);

        Assert.Equal(RoomStatus.Completed, room.Status);
    }

    [Fact]
    public async Task HandleAsync_WithValidRoom_SavesChanges()
    {
        var room = SeedActiveRoom();
        var command = new EndGameCommand(room.Id.Value);

        await _sut.HandleAsync(command);

        Assert.Equal(1, _unitOfWork.SaveChangesCallCount);
    }

    [Fact]
    public async Task HandleAsync_WithNonExistentRoom_ReturnsNotFoundError()
    {
        var command = new EndGameCommand(Guid.NewGuid());

        var result = await _sut.HandleAsync(command);

        Assert.True(result.IsFailure);
        Assert.Equal("room_not_found", result.Error!.Code);
    }

    [Fact]
    public async Task HandleAsync_WithNonExistentRoom_DoesNotSave()
    {
        var command = new EndGameCommand(Guid.NewGuid());

        await _sut.HandleAsync(command);

        Assert.Equal(0, _unitOfWork.SaveChangesCallCount);
    }

    [Fact]
    public async Task HandleAsync_WithLobbyRoom_ThrowsDomainConflictException()
    {
        var room = Room.Create("Host", DefaultSession);
        _roomRepository.Seed(room);
        var command = new EndGameCommand(room.Id.Value);

        var ex = await Assert.ThrowsAsync<DomainConflictException>(
            () => _sut.HandleAsync(command));
        Assert.Equal("room_not_active", ex.Code);
    }
}
