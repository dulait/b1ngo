using B1ngo.Application.Common;
using B1ngo.Domain.Core;
using B1ngo.Domain.Game;
using Microsoft.EntityFrameworkCore;

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

        try
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            return Result.Fail<StartGameResponse>(
                Error.Conflict("concurrency_conflict", "The room was modified by another request. Please try again.")
            );
        }

        return Result.Ok(new StartGameResponse(room.Id.Value, room.Status.ToString()));
    }
}
