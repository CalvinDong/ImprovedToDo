using Api.Dtos.Tasks;

public interface ITaskService
{
    Task<TaskResponse> CreateTask(CreateTaskRequest request, string userId, CancellationToken ct);
    Task<IEnumerable<TaskResponse>> GetTasks(GetTasksQuery query, string userId, CancellationToken ct);
    Task<TaskResponse> GetTaskById(Guid id, string userId, CancellationToken ct);
    Task<TaskResponse?> UpdateTasks(UpdateTaskRequest request, Guid id, string userId, CancellationToken ct);
    Task<bool?> DeleteTasks(Guid id, string userId, CancellationToken ct);
}