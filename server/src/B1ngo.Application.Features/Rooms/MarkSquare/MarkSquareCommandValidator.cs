using FluentValidation;

namespace B1ngo.Application.Features.Rooms.MarkSquare;

public sealed class UnmarkSquareCommandValidator : AbstractValidator<MarkSquareCommand>
{
    public UnmarkSquareCommandValidator()
    {
        RuleFor(x => x.Row).GreaterThanOrEqualTo(0).WithMessage("Row must be greater than or equal to 0.");
        RuleFor(x => x.Column).GreaterThanOrEqualTo(0).WithMessage("Column must be greater than or equal to 0.");
    }
}
