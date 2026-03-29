using FluentValidation;

namespace B1ngo.Application.Features.History;

public sealed class GetHistoryQueryValidator : AbstractValidator<GetHistoryQuery>
{
    public GetHistoryQueryValidator()
    {
        RuleFor(x => x.UserId).NotEmpty().WithMessage("User ID is required.");
        RuleFor(x => x.Page).GreaterThanOrEqualTo(1).WithMessage("Page must be at least 1.");
        RuleFor(x => x.PageSize).InclusiveBetween(1, 50).WithMessage("Page size must be between 1 and 50.");
    }
}
