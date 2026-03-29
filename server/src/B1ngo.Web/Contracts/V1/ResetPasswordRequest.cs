namespace B1ngo.Web.Contracts.V1;

public sealed record ResetPasswordRequest(string Email, string Token, string NewPassword);
