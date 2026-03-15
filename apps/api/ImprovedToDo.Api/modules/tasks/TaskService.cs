using Api.Dtos.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration.UserSecrets;
using Polly.CircuitBreaker;

public class TaskService : ITaskService
{
    private readonly AppDbContext _context;

    public TaskService(AppDbContext context) 
    {
        _context = context;    
    }

    public async Task<TaskResponse> CreateTask(CreateTaskRequest request, string userId, CancellationToken ct)
    {
        if (_context.TodoLists.Any())
        {
            var todoList = await _context.TodoLists
            .FirstOrDefaultAsync(x => x.Id == request.TodoListId && x.UserId == userId, ct);

            if (todoList is null)
            {
                throw new KeyNotFoundException("Todo list not found.");
            }
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


    public async Task<IEnumerable<TaskResponse>> GetTasks(GetTasksQuery query, string userId, CancellationToken ct)
    {
        var tasksQuery = _context.TodoItems
            .AsNoTracking()
            .Where(x => x.UserId == userId);
        
        if (query.TodoListId.HasValue)
            tasksQuery = tasksQuery.Where(x => x.TodoListId == query.TodoListId);
        
        if (query.Completed.HasValue)
            tasksQuery = tasksQuery.Where(x => x.Completed == query.Completed.Value);

        if (!string.IsNullOrWhiteSpace(query.Search))
            tasksQuery = tasksQuery.Where(x => x.Title.Contains(query.Search) || 
                                               (x.Description != null && x.Description.Contains(query.Search)));
        
        var tasks = await tasksQuery
            .OrderBy(x => x.Order)
            .ThenBy(x => x.CreatedAt)
            .Select(TaskResponse.Projection)
            .ToListAsync(ct);
        

        return tasks;
    }

    public async Task<TaskResponse?> GetTaskById(Guid id, string userId, CancellationToken ct)
    {
        var task = await _context.TodoItems
        .AsNoTracking()
        .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId, ct);

        return task is not null 
            ? TaskResponse.FromEntity(task) 
            : null;
    }

    public async Task<TaskResponse?> UpdateTasks(UpdateTaskRequest request, Guid id, string userId, CancellationToken ct)
    {
        var task = await _context.TodoItems
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId, ct);
        

        if (task is null) return null;

        if (request.Title is not null)
            task.Title = request.Title;

        if (request.Description is not null)
            task.Description = request.Description;

        if (request.DueDateSet)
            task.DueDate = request.DueDate;

        if (request.Completed.HasValue)
            task.Completed = request.Completed.Value;

        if (request.TodoListId.HasValue)
            task.TodoListId = request.TodoListId.Value;

        task.UpdatedAt = DateTimeOffset.UtcNow;

        await _context.SaveChangesAsync(ct);

        return TaskResponse.FromEntity(task);
    }

    public async Task<bool?> DeleteTasks(Guid id, string userId, CancellationToken ct)
    {
        var task = await _context.TodoItems
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId, ct);
        
        if (task is null) return null;

        _context.TodoItems.Remove(task);
        await _context.SaveChangesAsync(ct);

        return true;
    }
}