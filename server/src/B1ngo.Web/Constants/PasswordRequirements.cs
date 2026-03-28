namespace B1ngo.Web.Constants;

internal static class PasswordRequirements
{
    public const int MinimumLength = 8;
    public const bool RequireDigit = true;
    public const string DigitPattern = @"\d";
    public const string MinLengthMessage = "Password must be at least 8 characters.";
    public const string DigitMessage = "Password must contain at least one digit.";
}
