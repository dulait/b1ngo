using FluentValidation;

namespace B1ngo.Application.Features.Rooms.JoinRoom;

public sealed class JoinRoomCommandValidator : AbstractValidator<JoinRoomCommand>
{
    public JoinRoomCommandValidator()
    {
        RuleFor(x => x.JoinCode)
            .NotEmpty()
            .WithMessage("Join code is required.");

        RuleFor(x => x.DisplayName)
            .NotEmpty()
            .WithMessage("Display name is required.");
    }
}
