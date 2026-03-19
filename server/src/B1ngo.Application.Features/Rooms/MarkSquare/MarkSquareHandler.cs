using B1ngo.Application.Common;
using B1ngo.Domain.Core;
using B1ngo.Domain.Game;
using Microsoft.EntityFrameworkCore;

namespace B1ngo.Application.Features.Rooms.MarkSquare;

public sealed class MarkSquareHandler(IRoomRepository roomRepository, IUnitOfWork unitOfWork)
    : ICommandHandler<MarkSquareCommand, MarkSquareResponse>
{
    public async Task<Result<MarkSquareResponse>> HandleAsync(
        MarkSquareCommand command,
        CancellationToken cancellationToken = default
    )
    {
        var room = await roomRepository.GetByIdAsync(RoomId.From(command.RoomId), cancellationToken);

        if (room is null)
        {
            return Result.Fail<MarkSquareResponse>(Error.NotFound("room", command.RoomId));
        }

        var playerId = PlayerId.From(command.PlayerId);
        var utcNow = DateTimeOffset.UtcNow;

        room.MarkSquare(playerId, command.Row, command.Column, command.MarkedBy, utcNow);
        var winResult = room.EvaluateWin(playerId, utcNow);

        try
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            return Result.Fail<MarkSquareResponse>(
                Error.Conflict("concurrency_conflict", "The room was modified by another request. Please try again.")
            );
        }

        var player = room.Players.First(p => p.Id == playerId);
        var square = player.Card!.GetSquare(command.Row, command.Column);

        var bingo = winResult is not null ? new BingoInfo(winResult.Pattern.ToString(), winResult.Rank) : null;

        return Result.Ok(
            new MarkSquareResponse(
                square.Row,
                square.Column,
                square.IsMarked,
                square.MarkedBy!.Value.ToString(),
                square.MarkedAt!.Value,
                bingo
            )
        );
    }
}
