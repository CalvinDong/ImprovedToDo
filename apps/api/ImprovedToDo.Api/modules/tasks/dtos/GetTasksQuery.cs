namespace Api.Dtos.Tasks;

public sealed class GetTasksQuery
{
    public Guid? TodoListId { get; set; }
    public bool? Completed { get; set; }
    public string? Search { get; set; }
}
