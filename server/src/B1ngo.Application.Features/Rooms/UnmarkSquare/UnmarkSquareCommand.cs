using B1ngo.Application.Common;

namespace B1ngo.Application.Features.Rooms.UnmarkSquare;

public sealed record UnmarkSquareCommand(
    Guid RoomId,
    Guid PlayerId,
    int Row,
    int Column) : ICommand<UnmarkSquareResponse>;
