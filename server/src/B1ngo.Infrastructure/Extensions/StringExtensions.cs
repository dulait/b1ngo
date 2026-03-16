using System.Text.RegularExpressions;

namespace B1ngo.Infrastructure.Extensions;

internal static partial class StringExtensions
{
    public static string ToSnakeCase(this string input)
    {
        return string.IsNullOrEmpty(input) ? input : SnakeCaseRegex().Replace(input, "$1_$2").ToLowerInvariant();
    }

    public static string Pluralize(this string input)
    {
        if (string.IsNullOrEmpty(input))
        {
            return input;
        }

        if (
            input.EndsWith("ss", StringComparison.OrdinalIgnoreCase)
            || input.EndsWith("us", StringComparison.OrdinalIgnoreCase)
            || input.EndsWith("sh", StringComparison.OrdinalIgnoreCase)
            || input.EndsWith("ch", StringComparison.OrdinalIgnoreCase)
            || input.EndsWith("x", StringComparison.OrdinalIgnoreCase)
            || input.EndsWith("z", StringComparison.OrdinalIgnoreCase)
        )
        {
            return input + "es";
        }

        if (
            input.EndsWith("y", StringComparison.OrdinalIgnoreCase)
            && input.Length > 1
            && !"aeiou".Contains(input[^2], StringComparison.OrdinalIgnoreCase)
        )
        {
            return input[..^1] + "ies";
        }

        if (input.EndsWith("s", StringComparison.OrdinalIgnoreCase))
        {
            return input + "es";
        }

        return input + "s";
    }

    [GeneratedRegex(@"([a-z0-9])([A-Z])")]
    private static partial Regex SnakeCaseRegex();
}
