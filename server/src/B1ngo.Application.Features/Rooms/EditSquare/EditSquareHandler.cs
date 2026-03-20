using B1ngo.Application.Common;
using B1ngo.Domain.Core;
using B1ngo.Domain.Game;

namespace B1ngo.Application.Features.Rooms.EditSquare;

public sealed class EditSquareHandler(IRoomRepository roomRepository, IUnitOfWork unitOfWork)
    : ICommandHandler<EditSquareCommand, EditSquareResponse>
{
    public async Task<Result<EditSquareResponse>> HandleAsync(
        EditSquareCommand command,
        CancellationToken cancellationToken = default
    )
    {
        var room = await roomRepository.GetByIdAsync(RoomId.From(command.RoomId), cancellationToken);

        if (room is null)
        {
            return Result.Fail<EditSquareResponse>(Error.NotFound("room", command.RoomId));
        }

        var playerId = PlayerId.From(command.PlayerId);
        room.EditSquare(playerId, command.Row, command.Column, command.DisplayText);

        var saveResult = await unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
        {
            return Result.Fail<EditSquareResponse>(saveResult.Error!);
        }

        var player = room.Players.First(p => p.Id == playerId);
        var square = player.Card!.GetSquare(command.Row, command.Column);

        return Result.Ok(new EditSquareResponse(square.Row, square.Column, square.DisplayText, square.EventKey));
    }
}
