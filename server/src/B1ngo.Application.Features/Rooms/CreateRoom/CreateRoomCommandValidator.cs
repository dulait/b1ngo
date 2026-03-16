using FluentValidation;

namespace B1ngo.Application.Features.Rooms.CreateRoom;

public sealed class CreateRoomCommandValidator : AbstractValidator<CreateRoomCommand>
{
    public CreateRoomCommandValidator()
    {
        RuleFor(x => x.HostDisplayName).NotEmpty().WithMessage("Host display name is required.");

        RuleFor(x => x.GrandPrixName).NotEmpty().WithMessage("Grand Prix name is required.");

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
