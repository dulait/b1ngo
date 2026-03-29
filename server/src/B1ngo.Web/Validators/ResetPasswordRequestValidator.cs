using B1ngo.Web.Contracts.V1;
using B1ngo.Web.Extensions;
using FluentValidation;

namespace B1ngo.Web.Validators;

public sealed class ResetPasswordRequestValidator : AbstractValidator<ResetPasswordRequest>
{
    public ResetPasswordRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Token).NotEmpty();
        RuleFor(x => x.NewPassword).MeetsPasswordRequirements();
    }
}
