using FluentValidation;

namespace B1ngo.Application.Features.Rooms.StartGame;

public sealed class StartGameCommandValidator : AbstractValidator<StartGameCommand>
{
    public StartGameCommandValidator()
    {
        RuleFor(x => x.RoomId)
            .NotEmpty()
            .WithMessage("Room ID is required.");
    }
}
