using System.Linq.Expressions;
using FluentValidation;

namespace Api.Dtos.Tasks;

public sealed class CreateTaskRequest
{
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public DateTimeOffset? DueDate { get; set; }
    public Guid? TodoListId { get; set; }
    public string LexoRank { get; set; }
}

public class CreateTaskValidator : AbstractValidator<CreateTaskRequest>
{
    public CreateTaskValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .MaximumLength(200);
        RuleFor(x => x.Description)
            .MaximumLength(2000);
        RuleFor(x => x.LexoRank)
            .NotNull();
    }
}

public sealed class UpdateTaskRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }

    // lets you distinguish "not provided" vs "set to null"
    public bool DueDateSet { get; set; }
    public DateTimeOffset? DueDate { get; set; }

    public bool? Completed { get; set; }
    public Guid? TodoListId { get; set; }
}

public class UpdateTaskValidator : AbstractValidator<UpdateTaskRequest>
{
    public UpdateTaskValidator()
    {
        RuleFor(x => x.Title)
            .MaximumLength(200);
        RuleFor(x => x.Description)
            .MaximumLength(2000);
    }
}

public sealed class SetTaskCompleteRequest
{
    public bool Completed { get; set; }
}

public sealed class UpdateTaskPositionRequest
{
    public Guid? beforeTaskId { get; }
    public Guid? afterTaskId { get; }
    public Guid? TodoListId { get; set; }
}

public sealed class GetTasksQuery
{
    public Guid? TodoListId { get; set; }
    public bool? Completed { get; set; }
    public string? Search { get; set; }
}

public sealed class TaskResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public bool Completed { get; set; }
    public DateTimeOffset? DueDate { get; set; }
    public Guid? TodoListId { get; set; }
    public string LexoRank { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
    public DateTimeOffset? UpdatedAtUtc { get; set; }

    public static Expression<Func<TodoItem, TaskResponse>> Projection => 
        task => new TaskResponse
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Completed = task.Completed,
            DueDate = task.DueDate,
            TodoListId = task.TodoListId,
            LexoRank = task.LexoRank,
            CreatedAtUtc = task.CreatedAt,
            UpdatedAtUtc = task.UpdatedAt
        };

    public static TaskResponse FromEntity(TodoItem task)
    {
        return new TaskResponse
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Completed = task.Completed,
            DueDate = task.DueDate,
            TodoListId = task.TodoListId,
            LexoRank = task.LexoRank,
            CreatedAtUtc = task.CreatedAt,
            UpdatedAtUtc = task.UpdatedAt
        };
    }
}

