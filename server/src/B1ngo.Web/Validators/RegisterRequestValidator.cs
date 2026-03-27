using B1ngo.Web.Contracts.V1;
using B1ngo.Web.Extensions;
using FluentValidation;

namespace B1ngo.Web.Validators;

public sealed class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).MeetsPasswordRequirements();
        RuleFor(x => x.DisplayName).NotEmpty().MaximumLength(50);
    }
}
