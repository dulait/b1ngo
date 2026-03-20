using B1ngo.Application.Common;

namespace B1ngo.Application.Features.ReferenceData;

public sealed record GetReferenceDataResponse(
    IReadOnlyList<SessionTypeDto> SessionTypes,
    IReadOnlyList<GrandPrixDto> GrandPrix
);
