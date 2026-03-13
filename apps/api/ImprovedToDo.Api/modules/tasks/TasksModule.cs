using System.Runtime.CompilerServices;
using System.Security.Claims;
using Api.Dtos.Tasks;
using Microsoft.IdentityModel.Tokens;

public class TaskModule : IModule
{
    public IServiceCollection RegisterModule(IServiceCollection services)
    {
        services.AddScoped<ITaskService, TasksRepo>();
        return services;
    }

    public IEndpointRouteBuilder MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/tasks")
            .WithTags("Tasks")
            .RequireAuthorization();

        group.MapPost("/", CreateTask);
        /*group.MapGet("/", GetTasks);
        group.MapGet("/{id:guid}", GetTaskById);
        group.MapPatch("/{id:guid}", UpdateTask);
        group.MapDelete("/{id:guid}", DeleteTask);

        // Useful soon after:
        group.MapPatch("/{id:guid}/complete", SetTaskComplete);
        group.MapPatch("/{id:guid}/position", UpdateTaskPosition);*/

        return endpoints;
    }

    private static async Task<IResult> CreateTask(
        ITaskService TaskRepo, 
        CreateTaskRequest request, 
        ClaimsPrincipal user, 
        CancellationToken ct)
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Results.Unauthorized();

        var result = await TaskRepo.CreateTask(request, userId, ct);

        return Results.Created($"/tasks/{result.Id}", result);
    }

}