namespace B1ngo.Web.Contracts.V1;

public sealed record RegisterRequest(string Email, string Password, string DisplayName);
