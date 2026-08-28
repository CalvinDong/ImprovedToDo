public class Tag
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string Colour { get; set; } = "";

    public List<TodoItemTag> TodoItemTags { get; set; } = new();

    public string UserId { get; set; } = "";
    public ApplicationUser User { get; set; } = null!;
}
