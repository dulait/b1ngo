using B1ngo.Application.Common.Cqrs;
using B1ngo.Application.Common.Ports;
using B1ngo.Application.Common.Results;

namespace B1ngo.Application.Features.ReferenceData;

public sealed class GetReferenceDataHandler(IReferenceDataRepository referenceDataRepository)
    : IQueryHandler<GetReferenceDataQuery, GetReferenceDataResponse>
{
    public async Task<Result<GetReferenceDataResponse>> HandleAsync(
        GetReferenceDataQuery query,
        CancellationToken cancellationToken = default
    )
    {
        var grandPrix = await referenceDataRepository.GetGrandPrixAsync(cancellationToken);

        var seasons = grandPrix.Select(g => g.Season).Distinct().OrderByDescending(s => s).ToList();

        return Result.Ok(new GetReferenceDataResponse(seasons, grandPrix));
    }
}
