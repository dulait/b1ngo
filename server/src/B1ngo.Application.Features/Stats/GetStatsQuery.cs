using B1ngo.Application.Common.Cqrs;

namespace B1ngo.Application.Features.Stats;

public sealed record GetStatsQuery(Guid UserId) : IQuery<GetStatsResponse>;
