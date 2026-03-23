using Asp.Versioning;
using B1ngo.Application.Common.Cqrs;
using B1ngo.Application.Features.ReferenceData;
using Microsoft.AspNetCore.Mvc;

namespace B1ngo.Web.Controllers.V1;

[ApiVersion(1)]
[Produces("application/json")]
[Tags("Reference Data")]
[Route("api/v{version:apiVersion}/reference-data")]
public class ReferenceDataController(
    IQueryHandler<GetReferenceDataQuery, GetReferenceDataResponse> getReferenceDataHandler
) : ApiController
{
    [HttpGet]
    [EndpointName("GetReferenceData")]
    [EndpointSummary("Get reference data")]
    [EndpointDescription("Returns dropdown options for room creation. Public endpoint, no auth required.")]
    [ProducesResponseType<GetReferenceDataResponse>(StatusCodes.Status200OK)]
    [ResponseCache(Duration = 3600)]
    public async Task<IActionResult> GetReferenceData(CancellationToken ct) =>
        await Send(getReferenceDataHandler, new GetReferenceDataQuery(), ct);
}
