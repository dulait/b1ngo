using B1ngo.Application.Features.Rooms.JoinRoom;
using B1ngo.Application.Tests.Fakes;
using B1ngo.Domain.Core;
using B1ngo.Domain.Game;

namespace B1ngo.Application.Tests.Features.Rooms.JoinRoom;

public class JoinRoomHandlerTests
{
    private static readonly RaceSession DefaultSession = new(2026, "Bahrain Grand Prix", SessionType.Race);

    private readonly FakeRoomRepository _roomRepository = new();
    private readonly FakeUnitOfWork _unitOfWork = new();
    private readonly FakeBingoCardGenerator _cardGenerator = new();
    private readonly FakePlayerTokenStore _playerTokenStore = new();
    private readonly JoinRoomHandler _sut;

    public JoinRoomHandlerTests()
    {
        _sut = new JoinRoomHandler(_roomRepository, _unitOfWork, _cardGenerator, _playerTokenStore);
    }

    private Room SeedRoom()
    {
        var room = Room.Create("Host", DefaultSession);
        _roomRepository.Seed(room);
        return room;
    }

    [Fact]
    public async Task HandleAsync_WithValidInputs_ReturnsSuccessResult()
    {
        var room = SeedRoom();
        var command = new JoinRoomCommand(room.JoinCode, "Alice");

        var result = await _sut.HandleAsync(command);

        Assert.True(result.IsSuccess);
    }

    [Fact]
    public async Task HandleAsync_WithValidInputs_ReturnsPlayerInfo()
    {
        var room = SeedRoom();
        var command = new JoinRoomCommand(room.JoinCode, "Alice");

        var result = await _sut.HandleAsync(command);

        Assert.Equal(room.Id.Value, result.Value.RoomId);
        Assert.NotEqual(Guid.Empty, result.Value.PlayerId);
        Assert.Equal("Alice", result.Value.DisplayName);
    }

    [Fact]
    public async Task HandleAsync_WithValidInputs_AddsPlayerToRoom()
    {
        var room = SeedRoom();
        var command = new JoinRoomCommand(room.JoinCode, "Alice");

        await _sut.HandleAsync(command);

        Assert.Equal(2, room.Players.Count); // host + Alice
        Assert.Equal("Alice", room.Players[1].DisplayName);
    }

    [Fact]
    public async Task HandleAsync_WithValidInputs_SavesChanges()
    {
        var room = SeedRoom();
        var command = new JoinRoomCommand(room.JoinCode, "Alice");

        await _sut.HandleAsync(command);

        Assert.Equal(1, _unitOfWork.SaveChangesCallCount);
    }

    [Fact]
    public async Task HandleAsync_WithInvalidJoinCode_ReturnsNotFoundError()
    {
        var command = new JoinRoomCommand("INVALID", "Alice");

        var result = await _sut.HandleAsync(command);

        Assert.True(result.IsFailure);
        Assert.Equal("room_not_found", result.Error!.Code);
    }

    [Fact]
    public async Task HandleAsync_WithInvalidJoinCode_DoesNotSave()
    {
        var command = new JoinRoomCommand("INVALID", "Alice");

        await _sut.HandleAsync(command);

        Assert.Equal(0, _unitOfWork.SaveChangesCallCount);
    }

    [Fact]
    public async Task HandleAsync_WithDuplicateDisplayName_ThrowsDomainConflictException()
    {
        var room = SeedRoom();
        room.AddPlayer("Alice");
        var command = new JoinRoomCommand(room.JoinCode, "Alice");

        var ex = await Assert.ThrowsAsync<DomainConflictException>(
            () => _sut.HandleAsync(command));
        Assert.Equal("display_name_taken", ex.Code);
    }

    [Fact]
    public async Task HandleAsync_WithDuplicateDisplayNameDifferentCase_ThrowsDomainConflictException()
    {
        var room = SeedRoom();
        room.AddPlayer("Alice");
        var command = new JoinRoomCommand(room.JoinCode, "alice");

        var ex = await Assert.ThrowsAsync<DomainConflictException>(
            () => _sut.HandleAsync(command));
        Assert.Equal("display_name_taken", ex.Code);
    }
}
