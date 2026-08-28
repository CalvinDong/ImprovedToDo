using System.Security.Claims;
using Api.Dtos.Tasks;
using FluentValidation;

public class TaskModule : IModule
{
    public IServiceCollection RegisterModule(IServiceCollection services)
    {
        services.AddScoped<ITaskService, TaskService>();
        services.AddScoped<IValidator<CreateTaskRequest>, CreateTaskValidator>();
        services.AddScoped<IValidator<UpdateTaskRequest>, UpdateTaskValidator>();
        return services;
    }

    public IEndpointRouteBuilder MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/tasks")
            .WithTags("Tasks")
            .RequireAuthorization("ApiPolicy");

        group.MapPost("/", CreateTask);
        group.MapGet("/", GetTasks);
        group.MapGet("/{id:guid}", GetTaskById);
        group.MapPatch("/{id:guid}", UpdateTasks);
        group.MapDelete("/{id:guid}", DeleteTasks);
        
        // Useful soon after:
        group.MapPatch("/{id:guid}/complete", SetTasksComplete);
        group.MapPatch("/{id:guid}/position", UpdateTasksPosition);


        return endpoints;
    }

    private static async Task<IResult> CreateTask(
        ITaskService taskRepo, 
        IValidator<CreateTaskRequest> validator,
        CreateTaskRequest request, 
        ClaimsPrincipal user, 
        CancellationToken ct)
    {
        await validator.ValidateAndThrowAsync(request, ct);
               
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Results.Unauthorized();

        var result = await taskRepo.CreateTask(request, userId, ct);

        return Results.Created($"/tasks/{result.Id}", result);
    }

    
    private static async Task<IResult> GetTasks(
        ITaskService taskRepo,
        [AsParameters] GetTasksQuery query,
        ClaimsPrincipal user,
        CancellationToken ct)
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Results.Unauthorized();

        var result = await taskRepo.GetTasks(query, userId, ct);

        return Results.Ok(result);

    }

    private static async Task<IResult> GetTaskById(
        ITaskService taskRepo,
        Guid id,
        ClaimsPrincipal user,
        CancellationToken ct
    )
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Results.Unauthorized();

        return Results.Ok(await taskRepo.GetTaskById(id, userId, ct));
    }

    private static async Task<IResult> UpdateTasks(
        ITaskService taskRepo,
        IValidator<UpdateTaskRequest> validator,
        Guid id,
        UpdateTaskRequest request,
        ClaimsPrincipal user,
        CancellationToken ct
    )
    {
        await validator.ValidateAndThrowAsync(request, ct);

        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Results.Unauthorized();

        return Results.Ok(await taskRepo.UpdateTasks(request, id, userId, ct));
    }

    private static async Task<IResult> DeleteTasks(
        ITaskService taskRepo,
        Guid id,
        ClaimsPrincipal user,
        CancellationToken ct
    )
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Results.Unauthorized();

        await taskRepo.DeleteTasks(id, userId, ct);

        return Results.NoContent();
    }
    

    private static async Task<IResult> SetTasksComplete (
        ITaskService taskRepo,
        Guid id, 
        SetTaskCompleteRequest request, 
        ClaimsPrincipal user,
        CancellationToken ct
        )
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Results.Unauthorized();

        return Results.Ok(await taskRepo.SetTasksComplete(request, id, userId, ct));
    }

    private static async Task<IResult> UpdateTasksPosition(
        ITaskService taskRepo,
        UpdateTaskPositionRequest request,
        Guid id,
        ClaimsPrincipal user,
        CancellationToken ct
    )
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Results.Unauthorized();

        return Results.Ok(await taskRepo.UpdateTasksPosition(request, id, userId, ct));
    }


}