using Asp.Versioning;
using B1ngo.Application.Common.Cqrs;
using B1ngo.Application.Common.Ports;
using B1ngo.Application.Features.Rooms.CreateRoom;
using B1ngo.Application.Features.Rooms.EditSquare;
using B1ngo.Application.Features.Rooms.EndGame;
using B1ngo.Application.Features.Rooms.GetRoomState;
using B1ngo.Application.Features.Rooms.JoinRoom;
using B1ngo.Application.Features.Rooms.MarkSquare;
using B1ngo.Application.Features.Rooms.Reconnect;
using B1ngo.Application.Features.Rooms.StartGame;
using B1ngo.Application.Features.Rooms.UnmarkSquare;
using B1ngo.Web.Contracts.V1;
using B1ngo.Web.Filters;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace B1ngo.Web.Controllers.V1;

[ApiVersion(1)]
[Produces("application/json")]
[Tags("Rooms")]
public class RoomsController(
    ICommandHandler<CreateRoomCommand, CreateRoomResponse> createRoomHandler,
    ICommandHandler<JoinRoomCommand, JoinRoomResponse> joinRoomHandler,
    IQueryHandler<ReconnectQuery, ReconnectResponse> reconnectHandler,
    ICommandHandler<StartGameCommand, StartGameResponse> startGameHandler,
    ICommandHandler<EditSquareCommand, EditSquareResponse> editSquareHandler,
    ICommandHandler<MarkSquareCommand, MarkSquareResponse> markSquareHandler,
    ICommandHandler<UnmarkSquareCommand, UnmarkSquareResponse> unmarkSquareHandler,
    ICommandHandler<EndGameCommand, EndGameResponse> endGameHandler,
    IQueryHandler<GetRoomStateQuery, GetRoomStateResponse> getRoomStateHandler,
    ICurrentUserContext currentUserContext,
    IPlayerTokenStore playerTokenStore
) : ApiController
{
    [HttpPost]
    [EndpointName("CreateRoom")]
    [EndpointSummary("Create a new room")]
    [EndpointDescription(
        "Creates a new bingo room with the caller as host. Returns a join code and sets a PlayerToken cookie."
    )]
    [ProducesResponseType<CreateRoomResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status400BadRequest)]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> CreateRoom([FromBody] CreateRoomCommand command, CancellationToken ct) =>
        await Send(createRoomHandler, command, ct, response => SetPlayerTokenCookie(response.PlayerToken));

    [HttpPost("join")]
    [EndpointName("JoinRoom")]
    [EndpointSummary("Join an existing room")]
    [EndpointDescription("Joins a room using a join code. Returns player identity and sets a PlayerToken cookie.")]
    [ProducesResponseType<JoinRoomResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status409Conflict)]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> JoinRoom([FromBody] JoinRoomCommand command, CancellationToken ct) =>
        await Send(joinRoomHandler, command, ct, response => SetPlayerTokenCookie(response.PlayerToken));

    [HttpPost("reconnect")]
    [EndpointName("Reconnect")]
    [EndpointSummary("Reconnect to a room")]
    [EndpointDescription(
        "Re-establishes a player's session. Anonymous users use the PlayerToken cookie. "
            + "Registered users can pass a roomId to reconnect to a specific room, or omit it to get all active rooms."
    )]
    [ProducesResponseType<ReconnectResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Reconnect([FromBody] ReconnectRequest? request, CancellationToken ct)
    {
        var userId = currentUserContext.GetAuthenticatedUserId();

        if (userId is not null)
        {
            return await ReconnectRegisteredUser(userId.Value, request?.RoomId, ct);
        }

        if (
            !Request.Headers.TryGetValue("X-Player-Token", out var tokenValue)
            || !Guid.TryParse(tokenValue.FirstOrDefault(), out var token)
        )
        {
            return Unauthorized(new ErrorResponse("Unauthorized", "No active session found."));
        }

        var anonymousIdentity = await playerTokenStore.ResolveAsync(token, ct);
        if (anonymousIdentity is null)
        {
            return Unauthorized(new ErrorResponse("Unauthorized", "No active session found."));
        }

        return await Send(
            reconnectHandler,
            new ReconnectQuery(anonymousIdentity.RoomId, anonymousIdentity.PlayerId),
            ct
        );
    }

    private async Task<IActionResult> ReconnectRegisteredUser(Guid userId, Guid? roomId, CancellationToken ct)
    {
        if (roomId is not null)
        {
            var identity = await playerTokenStore.ResolveByUserAndRoomAsync(userId, roomId.Value, ct);
            if (identity is null)
            {
                return NotFound(new ErrorResponse("NotFound", "No session found for this room."));
            }

            return await Send(reconnectHandler, new ReconnectQuery(identity.RoomId, identity.PlayerId), ct);
        }

        var rooms = await playerTokenStore.GetActiveTokensForUserAsync(userId, ct);
        return Ok(
            new ReconnectRoomsResponse(rooms.Select(r => new ReconnectRoomSummary(r.RoomId, r.RoomStatus)).ToList())
        );
    }

    [HttpPost("{roomId:guid}/start")]
    [EndpointName("StartGame")]
    [EndpointSummary("Start the game")]
    [EndpointDescription("Transitions the room from lobby to in-progress. Only the host can start the game.")]
    [ProducesResponseType<StartGameResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status409Conflict)]
    [RequirePlayerToken]
    [HostOnly]
    public async Task<IActionResult> StartGame(Guid roomId, CancellationToken ct) =>
        await Send(startGameHandler, new StartGameCommand(roomId), ct);

    [HttpPost("{roomId:guid}/end")]
    [EndpointName("EndGame")]
    [EndpointSummary("End the game")]
    [EndpointDescription("Transitions the room from in-progress to completed. Only the host can end the game.")]
    [ProducesResponseType<EndGameResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status409Conflict)]
    [RequirePlayerToken]
    [HostOnly]
    public async Task<IActionResult> EndGame(Guid roomId, CancellationToken ct) =>
        await Send(endGameHandler, new EndGameCommand(roomId), ct);

    [HttpGet("{roomId:guid}")]
    [EndpointName("GetRoomState")]
    [EndpointSummary("Get full room state")]
    [EndpointDescription(
        "Returns the complete room state including players, cards, and leaderboard. Requires the caller to be a member of the room."
    )]
    [ProducesResponseType<GetRoomStateResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [RequirePlayerToken]
    public async Task<IActionResult> GetRoomState(Guid roomId, CancellationToken ct) =>
        await Send(getRoomStateHandler, new GetRoomStateQuery(roomId, Identity.PlayerId), ct);

    [HttpPut("{roomId:guid}/players/me/card/squares/{row:int}/{column:int}")]
    [EndpointName("EditSquare")]
    [EndpointSummary("Edit a bingo square")]
    [EndpointDescription("Updates the display text of a square on the caller's bingo card. Cannot edit free spaces.")]
    [ProducesResponseType<EditSquareResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status409Conflict)]
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
    [EndpointSummary("Mark a bingo square")]
    [EndpointDescription(
        "Marks a square on a player's card and evaluates win conditions. Can be called by the player or the host."
    )]
    [ProducesResponseType<MarkSquareResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status409Conflict)]
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
    [EndpointSummary("Unmark a bingo square")]
    [EndpointDescription("Unmarks a square on a player's card and re-evaluates win status. Cannot unmark free spaces.")]
    [ProducesResponseType<UnmarkSquareResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status409Conflict)]
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
                SameSite = SameSiteMode.Lax,
                Path = "/",
                Expires = DateTimeOffset.UtcNow.AddHours(24),
            }
        );
    }
}
