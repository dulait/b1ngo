using B1ngo.Application.Common.Cqrs;
using B1ngo.Application.Common.Ports;
using B1ngo.Application.Common.Results;
using B1ngo.Domain.Game;
using B1ngo.Web.Filters;
using Microsoft.AspNetCore.Mvc;

namespace B1ngo.Web;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public abstract class ApiController : ControllerBase
{
    protected PlayerIdentity Identity => (PlayerIdentity)HttpContext.Items[PlayerTokenAuthFilter.PlayerIdentityKey]!;

    protected SquareMarkedBy CallerMarkedBy => (SquareMarkedBy)HttpContext.Items[PlayerTokenAuthFilter.MarkedByKey]!;

    protected async Task<IActionResult> Send<TCommand, TResponse>(
        ICommandHandler<TCommand, TResponse> handler,
        TCommand command,
        CancellationToken ct,
        Action<TResponse>? onSuccess = null
    )
        where TCommand : ICommand<TResponse>
    {
        var result = await handler.HandleAsync(command, ct);
        return result.Match(
            response =>
            {
                onSuccess?.Invoke(response);
                return Ok(response);
            },
            ToActionResult
        );
    }

    protected async Task<IActionResult> Send<TQuery, TResponse>(
        IQueryHandler<TQuery, TResponse> handler,
        TQuery query,
        CancellationToken ct
    )
        where TQuery : IQuery<TResponse>
    {
        var result = await handler.HandleAsync(query, ct);
        return result.Match(response => Ok(response), ToActionResult);
    }

    protected IActionResult ToActionResult(Error error) =>
        error.Type switch
        {
            ErrorType.Validation => BadRequest(
                new
                {
                    error.Code,
                    error.Message,
                    error.Details,
                }
            ),
            ErrorType.NotFound => NotFound(new ErrorResponse(error.Code, error.Message)),
            ErrorType.Conflict => Conflict(new ErrorResponse(error.Code, error.Message)),
            ErrorType.Unauthorized => Unauthorized(new ErrorResponse(error.Code, error.Message)),
            ErrorType.Forbidden => StatusCode(403, new ErrorResponse(error.Code, error.Message)),
            _ => StatusCode(500, new ErrorResponse(error.Code, error.Message)),
        };
}
