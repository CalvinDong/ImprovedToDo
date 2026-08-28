using Api.Dtos.Tasks;
using Microsoft.EntityFrameworkCore;
using Api.Exceptions;

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
            .AnyAsync(x => x.Id == request.TodoListId && x.UserId == userId, ct);

            if (!todoList)
            {
                throw new NotFoundException("Todo list not found.");
            }
        }
        
        var taskItem = new TodoItem
        {
            Id = Guid.NewGuid(),
            TodoListId = request.TodoListId,
            Title = request.Title,
            Description = request.Description,
            LexoRank = request.LexoRank,
            Completed = false,
            DueDate = request.DueDate,
            CreatedAt = DateTimeOffset.UtcNow,
            UserId = userId
        };

        _context.TodoItems.Add(taskItem);
        try
        {
            await _context.SaveChangesAsync(ct);
        }
        catch (DbUpdateException)
        {
            throw new ConflictException("Unable to create the task due to a database conflict.");
        }

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
        
        return await tasksQuery
            .OrderBy(x => x.LexoRank)
            .ThenBy(x => x.CreatedAt)
            .Select(TaskResponse.Projection)
            .ToListAsync(ct);
    }

    public async Task<TaskResponse> GetTaskById(Guid id, string userId, CancellationToken ct)
    {
        var task = await _context.TodoItems
        .AsNoTracking()
        .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId, ct);

        if (task is null)
            throw new NotFoundException("Task not found.");

        return TaskResponse.FromEntity(task);
    }

    public async Task<TaskResponse?> UpdateTasks(UpdateTaskRequest request, Guid id, string userId, CancellationToken ct)
    {
        var task = await _context.TodoItems
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId, ct);
        

        if (task is null) 
            throw new NotFoundException("Task not found.");

        if (request.Title is not null)
            task.Title = request.Title;

        if (request.Description is not null)
            task.Description = request.Description;

        if (request.DueDateSet)
            task.DueDate = request.DueDate;

        if (request.Completed.HasValue)
            task.Completed = request.Completed.Value;

        if (request.TodoListId.HasValue)
        {
            var todoListExists = await _context.TodoLists
                .AnyAsync(x => x.Id == request.TodoListId.Value && x.UserId == userId, ct);

            if (!todoListExists)
                throw new NotFoundException("Todo list not found.");

            task.TodoListId = request.TodoListId.Value;
        }

        task.UpdatedAt = DateTimeOffset.UtcNow;

        try
        {
            await _context.SaveChangesAsync(ct);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException("The task was modified by another request.");
        }

        return TaskResponse.FromEntity(task);
    }

    public async Task DeleteTasks(Guid id, string userId, CancellationToken ct)
    {
        var task = await _context.TodoItems
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId, ct);
        
        if (task is null)
            throw new NotFoundException("Task not found.");

        _context.TodoItems.Remove(task);

        try
        {
            await _context.SaveChangesAsync(ct);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException("The task was modified by another request.");
        }
    }

    public async Task<TaskResponse> SetTasksComplete(SetTaskCompleteRequest request, Guid id, string userId, CancellationToken ct)
    {
        var task = await _context.TodoItems
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId, ct);
        
        if (task is null)
            throw new NotFoundException("Task not found.");

        task.Completed = request.Completed;
        task.UpdatedAt = DateTimeOffset.UtcNow;

        try
        {
            await _context.SaveChangesAsync(ct);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException("The task was modified by another request.");
        }

        return TaskResponse.FromEntity(task);
    }

    public async Task<TaskResponse> UpdateTasksPosition(UpdateTaskPositionRequest request, Guid id, string userId, CancellationToken ct)
{
    var task = await _context.TodoItems
        .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId, ct);

    if (task is null)
        throw new NotFoundException("Task not found.");

    if (request.BeforeTaskId == id || request.AfterTaskId == id)
        throw new ValidationException("A task cannot be positioned relative to itself.");

    if (request.BeforeTaskId is not null && request.BeforeTaskId == request.AfterTaskId)
        throw new ValidationException("Before and after tasks must be different tasks.");

    var beforeTask = request.BeforeTaskId is null
        ? null
        : await _context.TodoItems.FirstOrDefaultAsync(
            x => x.Id == request.BeforeTaskId && x.UserId == userId,
            ct);

    var afterTask = request.AfterTaskId is null
        ? null
        : await _context.TodoItems.FirstOrDefaultAsync(
            x => x.Id == request.AfterTaskId && x.UserId == userId,
            ct);

    if (request.BeforeTaskId is not null && beforeTask is null)
        throw new NotFoundException("Before task not found.");

    if (request.AfterTaskId is not null && afterTask is null)
        throw new NotFoundException("After task not found.");

    if (beforeTask is not null && beforeTask.TodoListId != task.TodoListId)
        throw new ValidationException("Before task must belong to the same list.");

    if (afterTask is not null && afterTask.TodoListId != task.TodoListId)
        throw new ValidationException("After task must belong to the same list.");

    if (beforeTask is not null && afterTask is not null &&
        string.CompareOrdinal(beforeTask.LexoRank, afterTask.LexoRank) >= 0)
        throw new ValidationException("Before task must be ordered before the after task.");

    var newRank = (beforeTask, afterTask) switch
    {
        (null, null) => LexoRankCalculator.InitialRank(),

        (null, not null) => LexoRankCalculator.Before(afterTask.LexoRank),

        (not null, null) => LexoRankCalculator.After(beforeTask.LexoRank),

        (not null, not null) => LexoRankCalculator.Between(
            beforeTask.LexoRank,
            afterTask.LexoRank)
    };

    task.LexoRank = newRank;

    try
    {
        await _context.SaveChangesAsync(ct);
    }
    catch (DbUpdateConcurrencyException)
    {
        throw new ConflictException("The task was modified by another request.");
    }

    return TaskResponse.FromEntity(task);
}
}
