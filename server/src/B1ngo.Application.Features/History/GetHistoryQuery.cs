using B1ngo.Application.Common.Cqrs;

namespace B1ngo.Application.Features.History;

public sealed record GetHistoryQuery(Guid UserId, int Page = 1, int PageSize = 10) : IQuery<GetHistoryResponse>;
