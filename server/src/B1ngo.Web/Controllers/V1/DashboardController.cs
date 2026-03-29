using System.Security.Claims;
using Asp.Versioning;
using B1ngo.Application.Common.Cqrs;
using B1ngo.Application.Features.Dashboard;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace B1ngo.Web.Controllers.V1;

[ApiVersion(1)]
[Produces("application/json")]
[Tags("Dashboard")]
[Authorize]
public class DashboardController(IQueryHandler<GetDashboardQuery, GetDashboardResponse> getDashboardHandler)
    : ApiController
{
    [HttpGet]
    [EndpointName("GetDashboard")]
    [EndpointSummary("Get authenticated user's dashboard")]
    [EndpointDescription("Returns the user's active rooms (max 5), total active room count, and quick stats summary.")]
    [ProducesResponseType<GetDashboardResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetDashboard(CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return await Send(getDashboardHandler, new GetDashboardQuery(userId), ct);
    }
}
