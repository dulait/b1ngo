using B1ngo.Application.Common;
using B1ngo.Domain.Game;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace B1ngo.Web.Filters;

internal sealed class PlayerTokenAuthFilter(IPlayerTokenStore playerTokenStore) : IAsyncActionFilter
{
    public const string PlayerIdentityKey = "PlayerIdentity";
    public const string MarkedByKey = "MarkedBy";
    private const string TokenHeader = "X-Player-Token";

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var requiresToken = context.ActionDescriptor.EndpointMetadata.Any(m => m is RequirePlayerTokenAttribute);

        if (!requiresToken)
        {
            await next();
            return;
        }

        if (
            !context.HttpContext.Request.Headers.TryGetValue(TokenHeader, out var tokenValue)
            || !Guid.TryParse(tokenValue.FirstOrDefault(), out var token)
        )
        {
            context.Result = ErrorResult(401, Error.Unauthorized());
            return;
        }

        var identity = await playerTokenStore.ResolveAsync(token, context.HttpContext.RequestAborted);
        if (identity is null)
        {
            context.Result = ErrorResult(401, Error.Unauthorized());
            return;
        }

        context.HttpContext.Items[PlayerIdentityKey] = identity;

        if (HasRoomIdMismatch(context, identity))
        {
            context.Result = ErrorResult(403, Error.Forbidden());
            return;
        }

        var requiresHost = context.ActionDescriptor.EndpointMetadata.Any(m => m is HostOnlyAttribute);

        if (requiresHost && !identity.IsHost)
        {
            context.Result = ErrorResult(403, Error.Forbidden());
            return;
        }

        var requiresPlayerOrHost = context.ActionDescriptor.EndpointMetadata.Any(m => m is PlayerOrHostAttribute);

        if (requiresPlayerOrHost)
        {
            if (
                !context.ActionArguments.TryGetValue("playerId", out var routePlayerId)
                || routePlayerId is not Guid targetPlayerId
            )
            {
                context.Result = ErrorResult(403, Error.Forbidden());
                return;
            }

            if (identity.PlayerId == targetPlayerId)
            {
                context.HttpContext.Items[MarkedByKey] = SquareMarkedBy.Player;
            }
            else if (identity.IsHost)
            {
                context.HttpContext.Items[MarkedByKey] = SquareMarkedBy.Host;
            }
            else
            {
                context.Result = ErrorResult(403, Error.Forbidden());
                return;
            }
        }

        await next();
    }

    private static bool HasRoomIdMismatch(ActionExecutingContext context, PlayerIdentity identity) =>
        context.ActionArguments.TryGetValue("roomId", out var routeRoomId)
        && routeRoomId is Guid roomId
        && identity.RoomId != roomId;

    private static ObjectResult ErrorResult(int statusCode, Error error) =>
        new(new { error.Code, error.Message }) { StatusCode = statusCode };
}
