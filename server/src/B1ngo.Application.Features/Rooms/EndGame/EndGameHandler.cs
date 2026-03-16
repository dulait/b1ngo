using B1ngo.Application.Common;
using B1ngo.Domain.Core;
using B1ngo.Domain.Game;

namespace B1ngo.Application.Features.Rooms.EndGame;

public sealed class EndGameHandler(IRoomRepository roomRepository, IUnitOfWork unitOfWork)
    : ICommandHandler<EndGameCommand, EndGameResponse>
{
    public async Task<Result<EndGameResponse>> HandleAsync(
        EndGameCommand command,
        CancellationToken cancellationToken = default
    )
    {
        var room = await roomRepository.GetByIdAsync(RoomId.From(command.RoomId), cancellationToken);

        if (room is null)
        {
            return Result.Fail<EndGameResponse>(Error.NotFound("room", command.RoomId));
        }

        room.EndGame();
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Ok(new EndGameResponse(room.Id.Value, room.Status.ToString()));
    }
}
