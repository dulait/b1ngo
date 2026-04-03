using B1ngo.Web.Contracts.V1;
using FluentValidation;

namespace B1ngo.Web.Validators;

public sealed class UpdateProfileRequestValidator : AbstractValidator<UpdateProfileRequest>
{
    public UpdateProfileRequestValidator()
    {
        RuleFor(x => x.DisplayName).NotEmpty().MaximumLength(50);
    }
}
