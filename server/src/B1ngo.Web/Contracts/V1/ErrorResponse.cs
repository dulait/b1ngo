namespace B1ngo.Web.Contracts.V1;

public sealed record ErrorResponse(string Code, string Message, IReadOnlyList<string>? Details = null);
