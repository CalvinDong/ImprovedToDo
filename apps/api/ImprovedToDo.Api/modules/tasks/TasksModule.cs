using System.Runtime.CompilerServices;
using System.Security.Claims;
using Api.Dtos.Tasks;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

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
            .RequireAuthorization();

        group.MapPost("/", CreateTask);
        group.MapGet("/", GetTasks);
        group.MapGet("/{id:guid}", GetTaskById);
        group.MapPatch("/{id:guid}", UpdateTasks);
        group.MapDelete("/{id:guid}", DeleteTasks);
        /*
        // Useful soon after:
        group.MapPatch("/{id:guid}/complete", SetTaskComplete);
        group.MapPatch("/{id:guid}/position", UpdateTaskPosition);*/

        return endpoints;
    }

    private static async Task<IResult> CreateTask(
        ITaskService taskRepo, 
        IValidator<CreateTaskRequest> validator,
        CreateTaskRequest request, 
        ClaimsPrincipal user, 
        CancellationToken ct)
    {
        var validation = await validator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());
               
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Results.Unauthorized();

        try
        {
            var result = await taskRepo.CreateTask(request, userId, ct);
            return Results.Created($"/tasks/{result.Id}", result);
        }
        catch (KeyNotFoundException ex)
        {
            return Results.NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return Results.BadRequest(new { message = ex.Message });
        }
        catch (DbUpdateException)
        {
            return Results.Problem(
                title: "Database update failed",
                detail: "The task could not be saved",
                statusCode: StatusCodes.Status500InternalServerError
            );
        }
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

        var result = await taskRepo.GetTaskById(id, userId, ct);

        return result is not null 
            ? Results.Ok(result)
            : Results.NotFound();
    }

    private static async Task<IResult> UpdateTasks(
        ITaskService taskRepo,
        Guid id,
        UpdateTaskRequest request,
        ClaimsPrincipal user,
        CancellationToken ct
    )
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Results.Unauthorized();

        var result = await taskRepo.UpdateTasks(request, id, userId, ct);

        return result is not null
            ? Results.Ok(result)
            : Results.NotFound();
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

        var result = await taskRepo.DeleteTasks(id, userId, ct);

        return result is not null
            ? Results.NoContent()
            : Results.NotFound();
    }
    



}