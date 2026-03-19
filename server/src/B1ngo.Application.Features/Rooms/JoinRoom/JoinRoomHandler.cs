using B1ngo.Application.Common;
using B1ngo.Domain.Core;
using B1ngo.Domain.Game;
using Microsoft.EntityFrameworkCore;

namespace B1ngo.Application.Features.Rooms.JoinRoom;

public sealed class JoinRoomHandler(
    IRoomRepository roomRepository,
    IUnitOfWork unitOfWork,
    IBingoCardGenerator cardGenerator,
    IPlayerTokenStore playerTokenStore
) : ICommandHandler<JoinRoomCommand, JoinRoomResponse>
{
    public async Task<Result<JoinRoomResponse>> HandleAsync(
        JoinRoomCommand command,
        CancellationToken cancellationToken = default
    )
    {
        var room = await roomRepository.GetByJoinCodeAsync(command.JoinCode, cancellationToken);

        if (room is null)
        {
            return Result.Fail<JoinRoomResponse>(Error.NotFound("room", command.JoinCode));
        }

        var player = room.AddPlayer(command.DisplayName);

        var card = cardGenerator.Generate(room.Session.SessionType, room.Configuration.MatrixSize);
        player.AssignCard(card);

        var playerToken = playerTokenStore.Create(player.Id.Value, room.Id.Value, isHost: false);

        try
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            return Result.Fail<JoinRoomResponse>(
                Error.Conflict("concurrency_conflict", "The room was modified by another request. Please try again.")
            );
        }

        return Result.Ok(new JoinRoomResponse(room.Id.Value, player.Id.Value, playerToken, player.DisplayName));
    }
}
