using B1ngo.Web.Constants;
using FluentValidation;

namespace B1ngo.Web.Extensions;

internal static class RuleBuilderExtensions
{
    public static IRuleBuilderOptions<T, string> MeetsPasswordRequirements<T>(this IRuleBuilder<T, string> ruleBuilder)
    {
        return ruleBuilder
            .NotEmpty()
            .MinimumLength(PasswordRequirements.MinimumLength)
            .WithMessage(PasswordRequirements.MinLengthMessage)
            .Matches(PasswordRequirements.DigitPattern)
            .WithMessage(PasswordRequirements.DigitMessage);
    }
}
