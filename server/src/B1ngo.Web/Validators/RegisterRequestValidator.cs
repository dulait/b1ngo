using B1ngo.Web.Contracts.V1;
using FluentValidation;

namespace B1ngo.Web.Validators;

public sealed class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8)
            .Matches(@"\d")
            .WithMessage("Password must contain at least one digit.");
        RuleFor(x => x.DisplayName).NotEmpty().MaximumLength(50);
    }
}
