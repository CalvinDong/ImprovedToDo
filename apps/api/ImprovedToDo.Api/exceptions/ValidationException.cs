namespace Api.Exceptions;

public sealed class ValidationException : Exception
{
    public IDictionary<string, string[]> Errors { get; }

    public ValidationException(IDictionary<string, string[]> errors)
        : base("Validation failed.")
    {
        Errors = errors;
    }

    public ValidationException(string message)
        : base(message)
    {
        Errors = new Dictionary<string, string[]>();
    }
}