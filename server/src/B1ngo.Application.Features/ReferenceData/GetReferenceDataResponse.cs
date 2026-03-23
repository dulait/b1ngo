using B1ngo.Application.Common.Ports;

namespace B1ngo.Application.Features.ReferenceData;

public sealed record GetReferenceDataResponse(IReadOnlyList<int> Seasons, IReadOnlyList<GrandPrixDto> GrandPrix);
