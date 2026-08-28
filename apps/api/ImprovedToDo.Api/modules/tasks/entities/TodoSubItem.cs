public class TodoSubItem
{
    public Guid Id { get; set; }

    public Guid TodoItemId { get; set; }
    public TodoItem TodoItem { get; set; } = null!;

    public string Name { get; set; } = "";
    public bool Completed { get; set; }
    public DateTimeOffset? DueDate { get; set;}

    public int Order { get; set; }
}
