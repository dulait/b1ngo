using B1ngo.Application.Common;
using B1ngo.Domain.Game;

namespace B1ngo.Application.Features.Rooms.CreateRoom;

public sealed record CreateRoomCommand(
    string HostDisplayName,
    int Season,
    string GrandPrixName,
    SessionType SessionType,
    int? MatrixSize = null,
    List<WinPatternType>? WinningPatterns = null) : ICommand<CreateRoomResponse>;
