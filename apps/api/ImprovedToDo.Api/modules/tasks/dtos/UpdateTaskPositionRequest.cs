namespace Api.Dtos.Tasks;

public sealed class UpdateTaskPositionRequest
{
    public Guid? beforeTaskId { get; }
    public Guid? afterTaskId { get; }
    public Guid? TodoListId { get; set; }
}
