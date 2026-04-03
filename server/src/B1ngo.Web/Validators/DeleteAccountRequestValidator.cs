using B1ngo.Web.Contracts.V1;
using FluentValidation;

namespace B1ngo.Web.Validators;

public sealed class DeleteAccountRequestValidator : AbstractValidator<DeleteAccountRequest>
{
    public DeleteAccountRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
    }
}
