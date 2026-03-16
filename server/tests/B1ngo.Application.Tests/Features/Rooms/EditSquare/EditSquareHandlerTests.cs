using B1ngo.Application.Features.Rooms.EditSquare;
using B1ngo.Application.Tests.Fakes;
using B1ngo.Domain.Core;
using B1ngo.Domain.Game;

namespace B1ngo.Application.Tests.Features.Rooms.EditSquare;

public class EditSquareHandlerTests
{
    private static readonly RaceSession DefaultSession = new(2026, "Bahrain Grand Prix", SessionType.Race);

    private readonly FakeRoomRepository _roomRepository = new();
    private readonly FakeUnitOfWork _unitOfWork = new();
    private readonly FakeBingoCardGenerator _cardGenerator = new();
    private readonly EditSquareHandler _sut;

    public EditSquareHandlerTests()
    {
        _sut = new EditSquareHandler(_roomRepository, _unitOfWork);
    }

    private (Room Room, Player Player) SeedRoomWithPlayer()
    {
        var room = Room.Create("Host", DefaultSession);
        var player = room.AddPlayer("Alice");
        var card = _cardGenerator.Generate(room.Session.SessionType, room.Configuration.MatrixSize);
        player.AssignCard(card);
        _roomRepository.Seed(room);
        return (room, player);
    }

    [Fact]
    public async Task HandleAsync_WithValidInputs_ReturnsSuccessResult()
    {
        var (room, player) = SeedRoomWithPlayer();
        var command = new EditSquareCommand(
            room.Id.Value, player.Id.Value, 0, 0, "My custom text");

        var result = await _sut.HandleAsync(command);

        Assert.True(result.IsSuccess);
    }

    [Fact]
    public async Task HandleAsync_WithValidInputs_ReturnsUpdatedSquare()
    {
        var (room, player) = SeedRoomWithPlayer();
        var command = new EditSquareCommand(
            room.Id.Value, player.Id.Value, 0, 0, "My custom text");

        var result = await _sut.HandleAsync(command);

        Assert.Equal(0, result.Value.Row);
        Assert.Equal(0, result.Value.Column);
        Assert.Equal("My custom text", result.Value.DisplayText);
        Assert.Null(result.Value.EventKey);
    }

    [Fact]
    public async Task HandleAsync_WithValidInputs_SavesChanges()
    {
        var (room, player) = SeedRoomWithPlayer();
        var command = new EditSquareCommand(
            room.Id.Value, player.Id.Value, 0, 0, "My custom text");

        await _sut.HandleAsync(command);

        Assert.Equal(1, _unitOfWork.SaveChangesCallCount);
    }

    [Fact]
    public async Task HandleAsync_WithNonExistentRoom_ReturnsNotFoundError()
    {
        var command = new EditSquareCommand(
            Guid.NewGuid(), Guid.NewGuid(), 0, 0, "My custom text");

        var result = await _sut.HandleAsync(command);

        Assert.True(result.IsFailure);
        Assert.Equal("room_not_found", result.Error!.Code);
    }

    [Fact]
    public async Task HandleAsync_WithNonExistentRoom_DoesNotSave()
    {
        var command = new EditSquareCommand(
            Guid.NewGuid(), Guid.NewGuid(), 0, 0, "My custom text");

        await _sut.HandleAsync(command);

        Assert.Equal(0, _unitOfWork.SaveChangesCallCount);
    }

    [Fact]
    public async Task HandleAsync_WhenRoomNotInLobby_ThrowsDomainConflictException()
    {
        var (room, player) = SeedRoomWithPlayer();
        // Assign card to host too, then start game
        var host = room.GetHost();
        var hostCard = _cardGenerator.Generate(room.Session.SessionType, room.Configuration.MatrixSize);
        host.AssignCard(hostCard);
        room.StartGame();

        var command = new EditSquareCommand(
            room.Id.Value, player.Id.Value, 0, 0, "My custom text");

        var ex = await Assert.ThrowsAsync<DomainConflictException>(
            () => _sut.HandleAsync(command));
        Assert.Equal("room_not_in_lobby", ex.Code);
    }

    [Fact]
    public async Task HandleAsync_WhenEditingFreeSpace_ThrowsDomainConflictException()
    {
        var (room, player) = SeedRoomWithPlayer();
        var center = room.Configuration.MatrixSize / 2;
        var command = new EditSquareCommand(
            room.Id.Value, player.Id.Value, center, center, "My custom text");

        var ex = await Assert.ThrowsAsync<DomainConflictException>(
            () => _sut.HandleAsync(command));
        Assert.Equal("square_is_free_space", ex.Code);
    }
}
