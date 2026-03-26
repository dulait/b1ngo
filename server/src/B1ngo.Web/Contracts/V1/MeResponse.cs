namespace B1ngo.Web.Contracts.V1;

public sealed record MeResponse(Guid UserId, string Email, string DisplayName, string[] Roles);
