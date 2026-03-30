using B1ngo.Application.Common.Cqrs;

namespace B1ngo.Application.Features.Dashboard;

public sealed record GetDashboardQuery(Guid UserId) : IQuery<GetDashboardResponse>;
