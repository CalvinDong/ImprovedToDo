public class TodoList
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";

    public int Order { get; set; }

    public List<TodoItem> Items { get; set; } = new();

    public string UserId { get; set; } = "";
    public ApplicationUser User { get; set; } = null!;
}
