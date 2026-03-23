using B1ngo.Application.Common.Cqrs;

namespace B1ngo.Application.Features.ReferenceData;

public sealed record GetReferenceDataQuery : IQuery<GetReferenceDataResponse>;
