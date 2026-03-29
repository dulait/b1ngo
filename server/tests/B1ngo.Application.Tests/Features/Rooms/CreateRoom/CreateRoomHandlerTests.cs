using B1ngo.Application.Features.Rooms.CreateRoom;
using B1ngo.Application.Tests.Fakes;
using B1ngo.Domain.Game;

namespace B1ngo.Application.Tests.Features.Rooms.CreateRoom;

public class CreateRoomHandlerTests
{
    private readonly FakeRoomRepository _roomRepository = new();
    private readonly FakeUnitOfWork _unitOfWork = new();
    private readonly FakeBingoCardGenerator _cardGenerator = new();
    private readonly FakePlayerTokenStore _playerTokenStore = new();
    private readonly FakeReferenceDataRepository _referenceDataRepository = new();
    private readonly FakeCurrentUserContext _currentUserContext = new();
    private readonly CreateRoomHandler _sut;

    public CreateRoomHandlerTests()
    {
        _sut = new CreateRoomHandler(
            _roomRepository,
            _unitOfWork,
            _cardGenerator,
            _playerTokenStore,
            _referenceDataRepository,
            _currentUserContext
        );
    }

    private static CreateRoomCommand ValidCommand =>
        new(HostDisplayName: "Host", Season: 2026, GrandPrixName: "Bahrain Grand Prix", SessionType: SessionType.Race);

    [Fact]
    public async Task HandleAsync_WithValidInputs_ReturnsSuccessResult()
    {
        var result = await _sut.HandleAsync(ValidCommand);

        Assert.True(result.IsSuccess);
    }

    [Fact]
    public async Task HandleAsync_WithValidInputs_ReturnsRoomIdJoinCodePlayerIdAndToken()
    {
        var result = await _sut.HandleAsync(ValidCommand);

        Assert.NotEqual(Guid.Empty, result.Value.RoomId);
        Assert.False(string.IsNullOrWhiteSpace(result.Value.JoinCode));
        Assert.Equal(6, result.Value.JoinCode.Length);
        Assert.NotEqual(Guid.Empty, result.Value.PlayerId);
        Assert.NotEqual(Guid.Empty, result.Value.PlayerToken);
    }

    [Fact]
    public async Task HandleAsync_WithValidInputs_PersistsRoomToRepository()
    {
        await _sut.HandleAsync(ValidCommand);

        Assert.Single(_roomRepository.AddedRooms);
    }

    [Fact]
    public async Task HandleAsync_WithValidInputs_SavesChanges()
    {
        await _sut.HandleAsync(ValidCommand);

        Assert.Equal(1, _unitOfWork.SaveChangesCallCount);
    }

    [Fact]
    public async Task HandleAsync_WithCustomConfiguration_CreatesRoomWithCustomConfig()
    {
        var command = ValidCommand with { MatrixSize = 7, WinningPatterns = [WinPatternType.Blackout] };

        var result = await _sut.HandleAsync(command);

        Assert.True(result.IsSuccess);
    }

    [Fact]
    public async Task HandleAsync_WithInvalidSessionTypeForGp_ReturnsFailure()
    {
        var command = ValidCommand with { SessionType = SessionType.Sprint };

        var result = await _sut.HandleAsync(command);

        Assert.True(result.IsFailure);
        Assert.Contains("session_type_invalid_for_gp", result.Error!.Code);
    }

    [Fact]
    public async Task HandleAsync_WhenAuthenticated_StampsUserId()
    {
        var userId = Guid.NewGuid();
        _currentUserContext.AuthenticatedUserId = userId;

        await _sut.HandleAsync(ValidCommand);

        Assert.Equal(userId, _playerTokenStore.LastCreatedUserId);
    }

    [Fact]
    public async Task HandleAsync_WhenAnonymous_PassesNullUserId()
    {
        _currentUserContext.AuthenticatedUserId = null;

        await _sut.HandleAsync(ValidCommand);

        Assert.Null(_playerTokenStore.LastCreatedUserId);
    }

    [Fact]
    public async Task HandleAsync_WithSprintSessionTypeForSprintGp_ReturnsSuccess()
    {
        var command = ValidCommand with
        {
            GrandPrixName = "Sprint Grand Prix",
            SessionType = SessionType.SprintQualifying,
        };

        var result = await _sut.HandleAsync(command);

        Assert.True(result.IsSuccess);
    }
}
