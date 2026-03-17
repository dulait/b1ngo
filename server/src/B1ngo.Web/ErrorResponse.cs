namespace B1ngo.Web;

public sealed record ErrorResponse(string Code, string Message, IReadOnlyList<string>? Details = null);
