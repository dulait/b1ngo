using System.Security.Claims;
using Asp.Versioning;
using B1ngo.Application.Common.Cqrs;
using B1ngo.Application.Features.Stats;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace B1ngo.Web.Controllers.V1;

[ApiVersion(1)]
[Produces("application/json")]
[Tags("Stats")]
[Authorize]
public class StatsController(IQueryHandler<GetStatsQuery, GetStatsResponse> getStatsHandler) : ApiController
{
    [HttpGet]
    [EndpointName("GetStats")]
    [EndpointSummary("Get authenticated user's game statistics")]
    [EndpointDescription("Returns aggregated stats: overview, wins by pattern, and best finishes.")]
    [ProducesResponseType<GetStatsResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetStats(CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return await Send(getStatsHandler, new GetStatsQuery(userId), ct);
    }
}
