namespace B1ngo.Web.Contracts.V1;

public sealed record ChangePasswordRequest(string CurrentPassword, string NewPassword);
