using System.Linq.Expressions;

namespace Api.Dtos.Tasks;

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
