namespace B1ngo.Domain.Core;

public class DomainException(string code, string message) : Exception(message)
{
    public string Code { get; } = code;
}
