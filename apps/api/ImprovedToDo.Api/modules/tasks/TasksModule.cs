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
            var result = await TaskRepo.CreateTask(request, userId, ct);
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

}