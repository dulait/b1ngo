namespace B1ngo.Domain.Core;

public sealed class DomainNotFoundException(string code, string message) : DomainException(code, message);
