using B1ngo.Application.Features.Rooms.StartGame;
using B1ngo.Application.Tests.Fakes;
using B1ngo.Domain.Core;
using B1ngo.Domain.Game;

namespace B1ngo.Application.Tests.Features.Rooms.StartGame;

public class StartGameHandlerTests
{
    private static readonly RaceSession DefaultSession = new(2026, "Bahrain Grand Prix", SessionType.Race);

    private readonly FakeRoomRepository _roomRepository = new();
    private readonly FakeUnitOfWork _unitOfWork = new();
    private readonly FakeBingoCardGenerator _cardGenerator = new();
    private readonly StartGameHandler _sut;

    public StartGameHandlerTests()
    {
        _sut = new StartGameHandler(_roomRepository, _unitOfWork);
    }

    private Room SeedRoomWithCards()
    {
        var room = Room.Create("Host", DefaultSession);
        var host = room.GetHost();
        var card = _cardGenerator.Generate(room.Session.SessionType, room.Configuration.MatrixSize);
        host.AssignCard(card);
        _roomRepository.Seed(room);
        return room;
    }

    [Fact]
    public async Task HandleAsync_WithValidRoom_ReturnsSuccessResult()
    {
        var room = SeedRoomWithCards();
        var command = new StartGameCommand(room.Id.Value);

        var result = await _sut.HandleAsync(command);

        Assert.True(result.IsSuccess);
    }

    [Fact]
    public async Task HandleAsync_WithValidRoom_ReturnsActiveStatus()
    {
        var room = SeedRoomWithCards();
        var command = new StartGameCommand(room.Id.Value);

        var result = await _sut.HandleAsync(command);

        Assert.Equal(room.Id.Value, result.Value.RoomId);
        Assert.Equal("Active", result.Value.Status);
    }

    [Fact]
    public async Task HandleAsync_WithValidRoom_TransitionsRoomToActive()
    {
        var room = SeedRoomWithCards();
        var command = new StartGameCommand(room.Id.Value);

        await _sut.HandleAsync(command);

        Assert.Equal(RoomStatus.Active, room.Status);
    }

    [Fact]
    public async Task HandleAsync_WithValidRoom_SavesChanges()
    {
        var room = SeedRoomWithCards();
        var command = new StartGameCommand(room.Id.Value);

        await _sut.HandleAsync(command);

        Assert.Equal(1, _unitOfWork.SaveChangesCallCount);
    }

    [Fact]
    public async Task HandleAsync_WithNonExistentRoom_ReturnsNotFoundError()
    {
        var command = new StartGameCommand(Guid.NewGuid());

        var result = await _sut.HandleAsync(command);

        Assert.True(result.IsFailure);
        Assert.Equal("room_not_found", result.Error!.Code);
    }

    [Fact]
    public async Task HandleAsync_WithNonExistentRoom_DoesNotSave()
    {
        var command = new StartGameCommand(Guid.NewGuid());

        await _sut.HandleAsync(command);

        Assert.Equal(0, _unitOfWork.SaveChangesCallCount);
    }

    [Fact]
    public async Task HandleAsync_WithActiveRoom_ThrowsDomainConflictException()
    {
        var room = SeedRoomWithCards();
        room.StartGame();
        var command = new StartGameCommand(room.Id.Value);

        var ex = await Assert.ThrowsAsync<DomainConflictException>(() => _sut.HandleAsync(command));
        Assert.Equal("room_not_in_lobby", ex.Code);
    }

    [Fact]
    public async Task HandleAsync_WithPlayerMissingCard_ThrowsDomainConflictException()
    {
        var room = SeedRoomWithCards();
        room.AddPlayer("Alice"); // Alice has no card
        var command = new StartGameCommand(room.Id.Value);

        var ex = await Assert.ThrowsAsync<DomainConflictException>(() => _sut.HandleAsync(command));
        Assert.Equal("players_missing_cards", ex.Code);
    }

    [Fact]
    public async Task HandleAsync_WithPlayerMissingCard_DoesNotSave()
    {
        var room = SeedRoomWithCards();
        room.AddPlayer("Alice"); // Alice has no card
        var command = new StartGameCommand(room.Id.Value);

        await Assert.ThrowsAsync<DomainConflictException>(() => _sut.HandleAsync(command));

        Assert.Equal(0, _unitOfWork.SaveChangesCallCount);
    }
}
