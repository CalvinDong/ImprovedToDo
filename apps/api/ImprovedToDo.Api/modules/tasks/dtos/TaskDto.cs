namespace Api.Dtos.Tasks;

public sealed class TaskDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool Completed { get; set; } = false;
    public Guid ListId { get; set; }
    public string LexoRank { get; set; }
    public List<TagDto> Tags { get; set; } = new();
    public List<Guid> ConnectedTaskIds { get; set; } = new();
    public List<SubTaskDto> Subtasks { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}