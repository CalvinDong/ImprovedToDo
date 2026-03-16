namespace Api.Exceptions;

public sealed class ValidationException : AppException
{
    public IDictionary<string, string[]>? Errors { get; }

    public ValidationException(string message) : base(message) { }

    public ValidationException(string message, IDictionary<string, string[]> errors) : base(message)
    {
        Errors = errors;
    }
}