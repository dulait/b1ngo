using FluentValidation;

namespace B1ngo.Application.Features.Rooms.EditSquare;

public sealed class EditSquareCommandValidator : AbstractValidator<EditSquareCommand>
{
    public EditSquareCommandValidator()
    {
        RuleFor(x => x.DisplayText).NotEmpty().WithMessage("Display text is required.");

        RuleFor(x => x.Row).GreaterThanOrEqualTo(0).WithMessage("Row must be greater than or equal to 0.");

        RuleFor(x => x.Column).GreaterThanOrEqualTo(0).WithMessage("Column must be greater than or equal to 0.");
    }
}
