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
        var sessionTypes = await referenceDataRepository.GetSessionTypesAsync(cancellationToken);
        var grandPrix = await referenceDataRepository.GetGrandPrixAsync(cancellationToken);

        return Result.Ok(new GetReferenceDataResponse(sessionTypes, grandPrix));
    }
}
