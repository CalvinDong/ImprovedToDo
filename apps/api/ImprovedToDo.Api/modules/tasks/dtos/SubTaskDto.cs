namespace Api.Dtos.Tasks;

public sealed class SubTaskDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool Completed { get; set; }
    public int Order { get; set; }
}