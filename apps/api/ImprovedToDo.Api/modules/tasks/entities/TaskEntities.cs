public class TodoList
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";

    public int Order { get; set; }

    public List<TodoItem> Items { get; set; } = new();

    public string UserId { get; set; } = "";
    public ApplicationUser User { get; set; } = null!;
}

public class TodoItem
{
    public Guid Id { get; set; }

    public Guid? TodoListId { get; set; }
    public TodoList? TodoList { get; set; } = null!;

    public string Title { get; set; } = "";
    public string? Description { get; set; }

    public int Order { get; set; }
    public bool Completed { get; set; }

    public DateTimeOffset? DueDate { get; set;}

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public List<TodoSubItem> SubItems { get; set; } = new();
    public List<TodoItemTag> TodoItemTags { get; set; } = new();

    public string UserId { get; set; } = "";
    public ApplicationUser User { get; set; } = null!;
}

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

public class TodoItemConnection // For if One task is blocked by another
{
    public Guid SourceTodoItemId { get; set; }
    public TodoItem SourceTodoItem { get; set; } = null!;

    public Guid TargetTodoItemId { get; set; }
    public TodoItem TargetTodoItem { get; set; } = null!;
}

public class Tag
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string Colour { get; set; } = "";

    public List<TodoItemTag> TodoItemTags { get; set; } = new();

    public string UserId { get; set; } = "";
    public ApplicationUser User { get; set; } = null!;
}

public class TodoItemTag
{
    public Guid TodoItemId { get; set; }
    public TodoItem TodoItem { get; set; } = null!;

    public Guid TagId { get; set; }
    public Tag Tag { get; set; } = null!;
}