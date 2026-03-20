using B1ngo.Application.Common;
using B1ngo.Domain.Game;

namespace B1ngo.Application.Features.Rooms.CreateRoom;

public sealed class CreateRoomHandler(
    IRoomRepository roomRepository,
    IUnitOfWork unitOfWork,
    IBingoCardGenerator cardGenerator,
    IPlayerTokenStore playerTokenStore,
    IReferenceDataRepository referenceDataRepository
) : ICommandHandler<CreateRoomCommand, CreateRoomResponse>
{
    public async Task<Result<CreateRoomResponse>> HandleAsync(
        CreateRoomCommand command,
        CancellationToken cancellationToken = default
    )
    {
        var validationResult = await ValidateSessionType(command, cancellationToken);
        if (validationResult is not null)
        {
            return validationResult;
        }

        var session = new RaceSession(command.Season, command.GrandPrixName, command.SessionType);
        var configuration = BuildConfiguration(command);

        var room = Room.Create(command.HostDisplayName, session, configuration);
        var host = room.GetHost();

        var card = await cardGenerator.GenerateAsync(
            command.SessionType,
            room.Configuration.MatrixSize,
            cancellationToken
        );
        host.AssignCard(card);

        var playerToken = playerTokenStore.Create(host.Id.Value, room.Id.Value, isHost: true);

        await roomRepository.AddAsync(room, cancellationToken);

        var saveResult = await unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
        {
            return Result.Fail<CreateRoomResponse>(saveResult.Error!);
        }

        return Result.Ok(new CreateRoomResponse(room.Id.Value, room.JoinCode, host.Id.Value, playerToken));
    }

    private async Task<Result<CreateRoomResponse>?> ValidateSessionType(
        CreateRoomCommand command,
        CancellationToken cancellationToken
    )
    {
        var gp = await referenceDataRepository.GetGrandPrixAsync(
            command.GrandPrixName,
            command.Season,
            cancellationToken
        );

        if (gp is null || !gp.SessionTypes.Contains(command.SessionType.ToString()))
        {
            return Result.Fail<CreateRoomResponse>(
                Error.Validation(
                    "session_type_invalid_for_gp",
                    $"Session type '{command.SessionType}' is not valid for {command.GrandPrixName} ({command.Season})."
                )
            );
        }

        return null;
    }

    private static RoomConfiguration? BuildConfiguration(CreateRoomCommand command)
    {
        if (command.MatrixSize is null && command.WinningPatterns is null)
        {
            return null;
        }

        var matrixSize = command.MatrixSize ?? RoomConfiguration.DefaultMatrixSize;
        var patterns = command.WinningPatterns ?? RoomConfiguration.DefaultWinningPatterns;

        return new RoomConfiguration(matrixSize, patterns);
    }
}
