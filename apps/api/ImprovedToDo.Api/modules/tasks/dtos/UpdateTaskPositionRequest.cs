namespace Api.Dtos.Tasks;

public sealed class UpdateTaskPositionRequest
{
    public Guid? BeforeTaskId { get; init; }
    public Guid? AfterTaskId { get; init; }
}
