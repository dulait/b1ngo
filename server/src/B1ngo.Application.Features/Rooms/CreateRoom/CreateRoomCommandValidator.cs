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
                RuleFor(x => x.MatrixSize!.Value)
                    .InclusiveBetween(3, 9)
                    .WithMessage("Matrix size must be between 3 and 9.")
                    .Must(size => size % 2 != 0)
                    .WithMessage("Matrix size must be odd to have a center free space.");
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
