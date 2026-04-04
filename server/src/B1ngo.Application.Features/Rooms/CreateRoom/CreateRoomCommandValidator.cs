using FluentValidation;

namespace B1ngo.Application.Features.Rooms.CreateRoom;

public sealed class CreateRoomCommandValidator : AbstractValidator<CreateRoomCommand>
{
    public CreateRoomCommandValidator()
    {
        RuleFor(x => x.HostDisplayName)
            .NotEmpty()
            .WithMessage("Host display name is required.")
            .MaximumLength(50)
            .WithMessage("Host display name must not exceed 50 characters.");

        RuleFor(x => x.GrandPrixName)
            .NotEmpty()
            .WithMessage("Grand Prix name is required.")
            .MaximumLength(100)
            .WithMessage("Grand Prix name must not exceed 100 characters.");

        When(
            x => x.MatrixSize is not null,
            () =>
            {
                RuleFor(x => x.MatrixSize!.Value).Must(size => size is 3 or 5).WithMessage("Card size must be 3 or 5.");
            }
        );

        When(
            x => x.WinningPatterns is not null,
            () =>
            {
                RuleFor(x => x.WinningPatterns!).NotEmpty().WithMessage("At least one winning pattern is required.");
            }
        );
    }
}
