using Api.Dtos.Tasks;

public interface ITaskService
{
    Task<TaskResponse> CreateTask(CreateTaskRequest request, string userId, CancellationToken ct);
}