using B1ngo.Application.Common.Cqrs;
using B1ngo.Application.Common.Ports;
using B1ngo.Application.Common.Results;
using B1ngo.Domain.Game;

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

        var card = await cardGenerator.GenerateAsync(
            room.Session.SessionType,
            room.Configuration.MatrixSize,
            cancellationToken
        );
        player.AssignCard(card);

        var playerToken = playerTokenStore.Create(player.Id.Value, room.Id.Value, isHost: false);

        var saveResult = await unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
        {
            return Result.Fail<JoinRoomResponse>(saveResult.Error!);
        }

        return Result.Ok(new JoinRoomResponse(room.Id.Value, player.Id.Value, playerToken, player.DisplayName));
    }
}
