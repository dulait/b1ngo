using FluentValidation;

namespace B1ngo.Application.Features.Rooms.EditSquare;

public sealed class EditSquareRequestValidator : AbstractValidator<EditSquareRequest>
{
    public EditSquareRequestValidator()
    {
        RuleFor(x => x.DisplayText)
            .NotEmpty()
            .WithMessage("Display text is required.")
            .MaximumLength(200)
            .WithMessage("Display text must not exceed 200 characters.")
            .Must(x => x is null || (!x.Contains('<') && !x.Contains('>')))
            .WithMessage("Display text must not contain HTML characters.");
    }
}
