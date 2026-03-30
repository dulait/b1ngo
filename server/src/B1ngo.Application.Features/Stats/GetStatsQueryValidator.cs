using FluentValidation;

namespace B1ngo.Application.Features.Stats;

public sealed class GetStatsQueryValidator : AbstractValidator<GetStatsQuery>
{
    public GetStatsQueryValidator()
    {
        RuleFor(x => x.UserId).NotEmpty().WithMessage("User ID is required.");
    }
}
