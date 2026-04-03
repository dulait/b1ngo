using B1ngo.Web.Contracts.V1;
using B1ngo.Web.Extensions;
using FluentValidation;

namespace B1ngo.Web.Validators;

public sealed class ChangePasswordRequestValidator : AbstractValidator<ChangePasswordRequest>
{
    public ChangePasswordRequestValidator()
    {
        RuleFor(x => x.CurrentPassword).NotEmpty();
        RuleFor(x => x.NewPassword).MeetsPasswordRequirements();
    }
}
