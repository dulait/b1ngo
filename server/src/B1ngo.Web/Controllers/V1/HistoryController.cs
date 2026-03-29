using System.Security.Claims;
using Asp.Versioning;
using B1ngo.Application.Common.Cqrs;
using B1ngo.Application.Features.History;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace B1ngo.Web.Controllers.V1;

[ApiVersion(1)]
[Produces("application/json")]
[Tags("History")]
[Authorize]
public class HistoryController(IQueryHandler<GetHistoryQuery, GetHistoryResponse> getHistoryHandler) : ApiController
{
    [HttpGet]
    [EndpointName("GetHistory")]
    [EndpointSummary("Get authenticated user's game history")]
    [EndpointDescription("Returns all active rooms (unpaginated) and completed rooms with page-based pagination.")]
    [ProducesResponseType<GetHistoryResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetHistory(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default
    )
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return await Send(getHistoryHandler, new GetHistoryQuery(userId, page, pageSize), ct);
    }
}
