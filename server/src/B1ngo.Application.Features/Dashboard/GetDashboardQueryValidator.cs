using FluentValidation;

namespace B1ngo.Application.Features.Dashboard;

public sealed class GetDashboardQueryValidator : AbstractValidator<GetDashboardQuery>
{
    public GetDashboardQueryValidator()
    {
        RuleFor(x => x.UserId).NotEmpty().WithMessage("User ID is required.");
    }
}
