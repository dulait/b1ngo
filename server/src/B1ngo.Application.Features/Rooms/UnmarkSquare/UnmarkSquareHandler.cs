using B1ngo.Application.Common.Cqrs;
using B1ngo.Application.Common.Ports;
using B1ngo.Application.Common.Results;
using B1ngo.Domain.Core;
using B1ngo.Domain.Game;

namespace B1ngo.Application.Features.Rooms.UnmarkSquare;

public sealed class UnmarkSquareHandler(IRoomRepository roomRepository, IUnitOfWork unitOfWork)
    : ICommandHandler<UnmarkSquareCommand, UnmarkSquareResponse>
{
    public async Task<Result<UnmarkSquareResponse>> HandleAsync(
        UnmarkSquareCommand command,
        CancellationToken cancellationToken = default
    )
    {
        var room = await roomRepository.GetByIdAsync(RoomId.From(command.RoomId), cancellationToken);

        if (room is null)
        {
            return Result.Fail<UnmarkSquareResponse>(Error.NotFound("room", command.RoomId));
        }

        var playerId = PlayerId.From(command.PlayerId);

        room.UnmarkSquare(playerId, command.Row, command.Column);
        var winRevoked = room.ReevaluateWin(playerId);

        var saveResult = await unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
        {
            return Result.Fail<UnmarkSquareResponse>(saveResult.Error!);
        }

        var player = room.Players.First(p => p.Id == playerId);
        var square = player.Card!.GetSquare(command.Row, command.Column);

        return Result.Ok(
            new UnmarkSquareResponse(
                square.Row,
                square.Column,
                square.IsMarked,
                square.MarkedBy?.ToString(),
                square.MarkedAt,
                winRevoked
            )
        );
    }
}
