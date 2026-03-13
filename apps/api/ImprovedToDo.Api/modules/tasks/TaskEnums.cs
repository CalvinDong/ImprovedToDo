using Api.Dtos.Tasks;

public enum TaskResultStatus
{
    Success,
    ValidationError,
    NotFound,
    Forbidden,
    Conflict,
    Unauthorized,
    Error
}

public sealed class TaskResult
{
    public TaskResultStatus Status { get; init; }
    public required TaskResponse Value { get; init; }
    public string? Message { get; init; }
    public Dictionary<string, string[]>? Errors { get; init; }

    /*public static Result<T> Success(T value) => new() { Status = ResultStatus.Success, Value = value };
    public static Result<T> NotFound(string? message = null) => new() { Status = ResultStatus.NotFound, Message = message };
    public static Result<T> Forbidden(string? message = null) => new() { Status = ResultStatus.Forbidden, Message = message };
    public static Result<T> Validation(Dictionary<string, string[]> errors) => new() { Status = ResultStatus.ValidationError, Errors = errors };*/
}