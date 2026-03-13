namespace Api.Dtos.Tasks;

public sealed class CreateTaskRequest
{
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public DateTime? DueDate { get; set; }
    public Guid? TodoListId { get; set; }
    public int? Position { get; set; }
}

public sealed class UpdateTaskRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }

    // lets you distinguish "not provided" vs "set to null"
    public bool DueDateSet { get; set; }
    public DateTime? DueDate { get; set; }

    public bool? IsCompleted { get; set; }
    public Guid? TodoListId { get; set; }
}

public sealed class SetTaskCompleteRequest
{
    public bool IsCompleted { get; set; }
}

public sealed class UpdateTaskPositionRequest
{
    public int Position { get; set; }
    public Guid? TodoListId { get; set; }
}

public sealed class GetTasksQuery
{
    public Guid? TodoListId { get; set; }
    public bool? IsCompleted { get; set; }
    public string? Search { get; set; }
}

public sealed class TaskResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime? DueDate { get; set; }
    public Guid? TodoListId { get; set; }
    public int Position { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }

    public static TaskResponse FromEntity(TodoItem task)
    {
        return new TaskResponse
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            IsCompleted = task.Completed,
            DueDate = task.DueDate,
            TodoListId = task.TodoListId,
            Position = task.Order,
            CreatedAtUtc = task.CreatedAt,
            UpdatedAtUtc = task.UpdatedAt
        };
    }
}

