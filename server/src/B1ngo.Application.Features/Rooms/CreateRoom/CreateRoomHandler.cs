using B1ngo.Application.Common;
using B1ngo.Domain.Core;
using B1ngo.Domain.Game;

namespace B1ngo.Application.Features.Rooms.CreateRoom;

public sealed class CreateRoomHandler(
    IRoomRepository roomRepository,
    IUnitOfWork unitOfWork,
    IBingoCardGenerator cardGenerator,
    IPlayerTokenStore playerTokenStore) : ICommandHandler<CreateRoomCommand, CreateRoomResponse>
{
    public async Task<Result<CreateRoomResponse>> HandleAsync(
        CreateRoomCommand command,
        CancellationToken cancellationToken = default)
    {
        var session = new RaceSession(command.Season, command.GrandPrixName, command.SessionType);
        var configuration = BuildConfiguration(command);

        var room = Room.Create(command.HostDisplayName, session, configuration);
        var host = room.GetHost();

        var card = cardGenerator.Generate(command.SessionType, room.Configuration.MatrixSize);
        host.AssignCard(card);

        var playerToken = playerTokenStore.Create(host.Id.Value, room.Id.Value, isHost: true);

        await roomRepository.AddAsync(room, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Ok(new CreateRoomResponse(
            room.Id.Value, room.JoinCode, host.Id.Value, playerToken));
    }

    private static RoomConfiguration? BuildConfiguration(CreateRoomCommand command)
    {
        if (command.MatrixSize is null && command.WinningPatterns is null)
        {
            return null;
        }

        var matrixSize = command.MatrixSize ?? RoomConfiguration.DefaultMatrixSize;
        var patterns = command.WinningPatterns
            ?? RoomConfiguration.DefaultWinningPatterns;

        return new RoomConfiguration(matrixSize, patterns);
    }
}
