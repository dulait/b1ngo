using B1ngo.Application.Common.Cqrs;
using B1ngo.Domain.Game;

namespace B1ngo.Application.Features.Rooms.MarkSquare;

public sealed record MarkSquareCommand(Guid RoomId, Guid PlayerId, int Row, int Column, SquareMarkedBy MarkedBy)
    : ICommand<MarkSquareResponse>;
