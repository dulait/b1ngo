using Asp.Versioning;
using B1ngo.Application.Common;
using B1ngo.Application.Features.Rooms.CreateRoom;
using B1ngo.Application.Features.Rooms.EditSquare;
using B1ngo.Application.Features.Rooms.EndGame;
using B1ngo.Application.Features.Rooms.GetRoomState;
using B1ngo.Application.Features.Rooms.JoinRoom;
using B1ngo.Application.Features.Rooms.MarkSquare;
using B1ngo.Application.Features.Rooms.Reconnect;
using B1ngo.Application.Features.Rooms.StartGame;
using B1ngo.Application.Features.Rooms.UnmarkSquare;
using B1ngo.Web.Filters;
using Microsoft.AspNetCore.Mvc;

namespace B1ngo.Web.Controllers.V1;

[ApiVersion(1)]
public class RoomsController(
    ICommandHandler<CreateRoomCommand, CreateRoomResponse> createRoomHandler,
    ICommandHandler<JoinRoomCommand, JoinRoomResponse> joinRoomHandler,
    IQueryHandler<ReconnectQuery, ReconnectResponse> reconnectHandler,
    ICommandHandler<StartGameCommand, StartGameResponse> startGameHandler,
    ICommandHandler<EditSquareCommand, EditSquareResponse> editSquareHandler,
    ICommandHandler<MarkSquareCommand, MarkSquareResponse> markSquareHandler,
    ICommandHandler<UnmarkSquareCommand, UnmarkSquareResponse> unmarkSquareHandler,
    ICommandHandler<EndGameCommand, EndGameResponse> endGameHandler,
    IQueryHandler<GetRoomStateQuery, GetRoomStateResponse> getRoomStateHandler
) : ApiController
{
    [HttpPost]
    [EndpointName("CreateRoom")]
    public async Task<IActionResult> CreateRoom([FromBody] CreateRoomCommand command, CancellationToken ct) =>
        await Send(createRoomHandler, command, ct, response => SetPlayerTokenCookie(response.PlayerToken));

    [HttpPost("join")]
    [EndpointName("JoinRoom")]
    public async Task<IActionResult> JoinRoom([FromBody] JoinRoomCommand command, CancellationToken ct) =>
        await Send(joinRoomHandler, command, ct, response => SetPlayerTokenCookie(response.PlayerToken));

    [HttpPost("reconnect")]
    [EndpointName("Reconnect")]
    [RequirePlayerToken]
    public async Task<IActionResult> Reconnect(CancellationToken ct) =>
        await Send(reconnectHandler, new ReconnectQuery(Identity.RoomId, Identity.PlayerId), ct);

    [HttpPost("{roomId:guid}/start")]
    [EndpointName("StartGame")]
    [RequirePlayerToken]
    [HostOnly]
    public async Task<IActionResult> StartGame(Guid roomId, CancellationToken ct) =>
        await Send(startGameHandler, new StartGameCommand(roomId), ct);

    [HttpPost("{roomId:guid}/end")]
    [EndpointName("EndGame")]
    [RequirePlayerToken]
    [HostOnly]
    public async Task<IActionResult> EndGame(Guid roomId, CancellationToken ct) =>
        await Send(endGameHandler, new EndGameCommand(roomId), ct);

    [HttpGet("{roomId:guid}")]
    [EndpointName("GetRoomState")]
    [RequirePlayerToken]
    public async Task<IActionResult> GetRoomState(Guid roomId, CancellationToken ct) =>
        await Send(getRoomStateHandler, new GetRoomStateQuery(roomId, Identity.PlayerId), ct);

    [HttpPut("{roomId:guid}/players/me/card/squares/{row:int}/{column:int}")]
    [EndpointName("EditSquare")]
    [RequirePlayerToken]
    public async Task<IActionResult> EditSquare(
        Guid roomId,
        int row,
        int column,
        [FromBody] EditSquareRequest request,
        CancellationToken ct
    ) =>
        await Send(
            editSquareHandler,
            new EditSquareCommand(Identity.RoomId, Identity.PlayerId, row, column, request.DisplayText),
            ct
        );

    [HttpPost("{roomId:guid}/players/{playerId:guid}/card/squares/{row:int}/{column:int}/mark")]
    [EndpointName("MarkSquare")]
    [RequirePlayerToken]
    [PlayerOrHost]
    public async Task<IActionResult> MarkSquare(
        Guid roomId,
        Guid playerId,
        int row,
        int column,
        CancellationToken ct
    ) => await Send(markSquareHandler, new MarkSquareCommand(roomId, playerId, row, column, CallerMarkedBy), ct);

    [HttpPost("{roomId:guid}/players/{playerId:guid}/card/squares/{row:int}/{column:int}/unmark")]
    [EndpointName("UnmarkSquare")]
    [RequirePlayerToken]
    [PlayerOrHost]
    public async Task<IActionResult> UnmarkSquare(
        Guid roomId,
        Guid playerId,
        int row,
        int column,
        CancellationToken ct
    ) => await Send(unmarkSquareHandler, new UnmarkSquareCommand(roomId, playerId, row, column), ct);

    private void SetPlayerTokenCookie(Guid playerToken)
    {
        Response.Cookies.Append(
            "PlayerToken",
            playerToken.ToString(),
            new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Path = "/",
            }
        );
    }
}
