using FluentValidation;

namespace B1ngo.Application.Features.Rooms.EditSquare;

public sealed class EditSquareCommandValidator : AbstractValidator<EditSquareCommand>
{
    public EditSquareCommandValidator()
    {
        RuleFor(x => x.DisplayText)
            .NotEmpty()
            .WithMessage("Display text is required.")
            .MaximumLength(200)
            .WithMessage("Display text must not exceed 200 characters.")
            .Must(x => x is null || (!x.Contains('<') && !x.Contains('>')))
            .WithMessage("Display text must not contain HTML characters.");

        RuleFor(x => x.Row).GreaterThanOrEqualTo(0).WithMessage("Row must be greater than or equal to 0.");

        RuleFor(x => x.Column).GreaterThanOrEqualTo(0).WithMessage("Column must be greater than or equal to 0.");
    }
}
