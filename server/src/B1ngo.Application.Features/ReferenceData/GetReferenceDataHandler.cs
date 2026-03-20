using B1ngo.Application.Common;

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
