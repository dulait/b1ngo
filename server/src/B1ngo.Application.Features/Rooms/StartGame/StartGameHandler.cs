using B1ngo.Application.Common.Cqrs;
using B1ngo.Application.Common.Ports;
using B1ngo.Application.Common.Results;
using B1ngo.Domain.Game;

namespace B1ngo.Application.Features.Rooms.StartGame;

public sealed class StartGameHandler(IRoomRepository roomRepository, IUnitOfWork unitOfWork)
    : ICommandHandler<StartGameCommand, StartGameResponse>
{
    public async Task<Result<StartGameResponse>> HandleAsync(
        StartGameCommand command,
        CancellationToken cancellationToken = default
    )
    {
        var room = await roomRepository.GetByIdAsync(RoomId.From(command.RoomId), cancellationToken);

        if (room is null)
        {
            return Result.Fail<StartGameResponse>(Error.NotFound("room", command.RoomId));
        }

        room.StartGame();

        var saveResult = await unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
        {
            return Result.Fail<StartGameResponse>(saveResult.Error!);
        }

        return Result.Ok(new StartGameResponse(room.Id.Value, room.Status.ToString()));
    }
}
