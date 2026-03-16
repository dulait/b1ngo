using B1ngo.Application.Common;

namespace B1ngo.Application.Features.Rooms.EditSquare;

public sealed record EditSquareCommand(
    Guid RoomId,
    Guid PlayerId,
    int Row,
    int Column,
    string DisplayText) : ICommand<EditSquareResponse>;
