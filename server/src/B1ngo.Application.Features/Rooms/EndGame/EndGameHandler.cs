using B1ngo.Application.Common.Cqrs;
using B1ngo.Application.Common.Ports;
using B1ngo.Application.Common.Results;
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

        var saveResult = await unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
        {
            return Result.Fail<EndGameResponse>(saveResult.Error!);
        }

        return Result.Ok(new EndGameResponse(room.Id.Value, room.Status.ToString()));
    }
}
