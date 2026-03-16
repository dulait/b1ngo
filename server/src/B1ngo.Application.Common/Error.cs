namespace B1ngo.Application.Common;

public enum ErrorType
{
    Validation,
    NotFound,
    Conflict,
    Unauthorized,
    Forbidden,
    Unexpected,
}

public sealed record Error(ErrorType Type, string Code, string Message)
{
    public IReadOnlyList<string>? Details { get; init; }

    public static Error Validation(string code, string message) =>
        new(ErrorType.Validation, $"validation_{code}", message);

    public static Error ValidationMultiple(IReadOnlyList<string> details) =>
        new(ErrorType.Validation, "validation_error", "One or more validation errors occurred.") { Details = details };

    public static Error NotFound(string entity, object id) =>
        new(ErrorType.NotFound, $"{entity}_not_found", $"{entity} with ID '{id}' was not found.");

    public static Error Conflict(string code, string message) => new(ErrorType.Conflict, code, message);

    public static Error Unauthorized(string message = "Missing or invalid player token.") =>
        new(ErrorType.Unauthorized, "unauthorized", message);

    public static Error Forbidden(string message = "You do not have permission to perform this action.") =>
        new(ErrorType.Forbidden, "forbidden", message);

    public static Error Unexpected(string message) => new(ErrorType.Unexpected, "unexpected", message);
}
