public class TodoItem
{
    public Guid Id { get; set; }

    public Guid? TodoListId { get; set; }
    public TodoList? TodoList { get; set; } = null!;

    public string Title { get; set; } = "";
    public string? Description { get; set; }

    public string LexoRank { get; set; }
    public bool Completed { get; set; }

    public DateTimeOffset? DueDate { get; set;}

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public List<TodoSubItem> SubItems { get; set; } = new();
    public List<TodoItemTag> TodoItemTags { get; set; } = new();

    public string UserId { get; set; } = "";
    public ApplicationUser User { get; set; } = null!;
}
