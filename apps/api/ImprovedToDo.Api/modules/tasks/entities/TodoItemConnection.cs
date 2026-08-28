public class TodoItemConnection // For if One task is blocked by another
{
    public Guid SourceTodoItemId { get; set; }
    public TodoItem SourceTodoItem { get; set; } = null!;

    public Guid TargetTodoItemId { get; set; }
    public TodoItem TargetTodoItem { get; set; } = null!;
}
