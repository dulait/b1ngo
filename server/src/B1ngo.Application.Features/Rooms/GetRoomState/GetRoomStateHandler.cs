using B1ngo.Application.Common.Cqrs;
using B1ngo.Application.Common.Results;
using B1ngo.Domain.Game;

namespace B1ngo.Application.Features.Rooms.GetRoomState;

public sealed class GetRoomStateHandler(IRoomRepository roomRepository)
    : IQueryHandler<GetRoomStateQuery, GetRoomStateResponse>
{
    public async Task<Result<GetRoomStateResponse>> HandleAsync(
        GetRoomStateQuery query,
        CancellationToken cancellationToken = default
    )
    {
        var room = await roomRepository.GetByIdAsync(RoomId.From(query.RoomId), cancellationToken);

        if (room is null)
        {
            return Result.Fail<GetRoomStateResponse>(Error.NotFound("room", query.RoomId));
        }

        var requestingPlayerId = PlayerId.From(query.PlayerId);
        var isHost = room.HostPlayerId == requestingPlayerId;

        return Result.Ok(MapRoomState(room, requestingPlayerId, isHost));
    }

    private static GetRoomStateResponse MapRoomState(Room room, PlayerId requestingPlayerId, bool isHost)
    {
        var session = new SessionDto(
            room.Session.Season,
            room.Session.GrandPrixName,
            room.Session.SessionType.ToString()
        );

        var configuration = new ConfigurationDto(
            room.Configuration.MatrixSize,
            room.Configuration.WinningPatterns.Select(p => p.ToString()).ToList()
        );

        var players = room.Players.Select(p => MapPlayer(p, requestingPlayerId, isHost)).ToList();

        var leaderboard = room
            .Leaderboard.Select(e => new LeaderboardEntryDto(
                e.PlayerId.Value,
                e.Rank,
                e.WinningPattern.ToString(),
                e.WinningSquares.Select(s => new SquarePositionDto(s.Row, s.Column)).ToList(),
                e.CompletedAt
            ))
            .ToList();

        return new GetRoomStateResponse(
            room.Id.Value,
            room.JoinCode,
            room.Status.ToString(),
            session,
            configuration,
            room.HostPlayerId.Value,
            players,
            leaderboard
        );
    }

    private static PlayerDto MapPlayer(Player player, PlayerId requestingPlayerId, bool isHost)
    {
        var isOwnCard = player.Id == requestingPlayerId;
        CardDto? card = null;

        if (player.Card is not null && (isOwnCard || isHost))
        {
            var squares = player
                .Card.Squares.Select(s => new SquareDto(
                    s.Row,
                    s.Column,
                    s.DisplayText,
                    s.EventKey,
                    s.IsFreeSpace,
                    s.IsMarked,
                    s.MarkedBy?.ToString(),
                    s.MarkedAt
                ))
                .ToList();

            card = new CardDto(player.Card.MatrixSize, squares);
        }

        return new PlayerDto(player.Id.Value, player.DisplayName, player.HasWon, card);
    }
}
