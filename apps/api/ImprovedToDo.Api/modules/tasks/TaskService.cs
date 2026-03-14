using Api.Dtos.Tasks;
using Microsoft.EntityFrameworkCore;

public class TaskService : ITaskService
{
    private readonly AppDbContext _context;

    public TaskService(AppDbContext context) 
    {
        _context = context;    
    }

    public async Task<TaskResponse> CreateTask(CreateTaskRequest request, string userId, CancellationToken ct)
    {
        var todoList = await _context.TodoLists
            .FirstOrDefaultAsync(x => x.Id == request.TodoListId && x.UserId == userId, ct);

        if (todoList is null)
        {
            throw new KeyNotFoundException("Todo list not found.");
        }

        var taskItem = new TodoItem
        {
            Id = Guid.NewGuid(),
            TodoListId = request.TodoListId,
            Title = request.Title,
            Description = request.Description,
            Order = request.Position ?? 0,
            Completed = false,
            DueDate = request.DueDate,
            CreatedAt = DateTimeOffset.UtcNow,
            UserId = userId
        };

        _context.TodoItems.Add(taskItem);
        await _context.SaveChangesAsync(ct);

        return TaskResponse.FromEntity(taskItem);

    }
}