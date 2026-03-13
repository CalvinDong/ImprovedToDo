using Api.Dtos.Tasks;

public class TasksRepo : ITaskService
{
    private readonly AppDbContext _context;

    public TasksRepo(AppDbContext context) 
    {
        _context = context;    
    }

    public async Task<TaskResponse> CreateTask(CreateTaskRequest request, string userId, CancellationToken ct)
    {
        var taskItem = new TodoItem
        {
            Id = Guid.NewGuid(),
            TodoListId = request.TodoListId,
            Title = request.Title,
            Description = request.Description,
            Order = request.Position ?? 0,
            Completed = false,
            DueDate = request.DueDate,
            CreatedAt = DateTime.UtcNow,
            UserId = userId
        };

        _context.TodoItems.Add(taskItem);
        await _context.SaveChangesAsync(ct);

        return TaskResponse.FromEntity(taskItem);

    }
}