using FluentValidation;

namespace B1ngo.Application.Features.Rooms.JoinRoom;

public sealed class JoinRoomCommandValidator : AbstractValidator<JoinRoomCommand>
{
    public JoinRoomCommandValidator()
    {
        RuleFor(x => x.JoinCode)
            .NotEmpty()
            .WithMessage("Join code is required.")
            .Length(6)
            .WithMessage("Join code must be exactly 6 characters.");

        RuleFor(x => x.DisplayName)
            .NotEmpty()
            .WithMessage("Display name is required.")
            .MaximumLength(50)
            .WithMessage("Display name must not exceed 50 characters.")
            .Must(x => x is null || (!x.Contains('<') && !x.Contains('>')))
            .WithMessage("Display name must not contain HTML characters.");
    }
}
