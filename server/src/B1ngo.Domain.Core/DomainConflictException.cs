namespace B1ngo.Domain.Core;

public sealed class DomainConflictException(string code, string message) : DomainException(code, message);
