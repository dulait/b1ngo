using B1ngo.Application.Common;
using B1ngo.Domain.Game;

namespace B1ngo.Application.Features.Rooms.Reconnect;

public sealed class ReconnectHandler(
    IRoomRepository roomRepository) : IQueryHandler<ReconnectQuery, ReconnectResponse>
{
    public async Task<Result<ReconnectResponse>> HandleAsync(
        ReconnectQuery query,
        CancellationToken cancellationToken = default)
    {
        var room = await roomRepository.GetByIdAsync(
            RoomId.From(query.RoomId), cancellationToken);

        if (room is null)
        {
            return Result.Fail<ReconnectResponse>(Error.NotFound("room", query.RoomId));
        }

        return Result.Ok(new ReconnectResponse(room.Id.Value, query.PlayerId, room.Status.ToString()));
    }
}
