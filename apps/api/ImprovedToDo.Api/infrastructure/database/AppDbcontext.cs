using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<TodoList> TodoLists => Set<TodoList>();
    public DbSet<TodoItem> TodoItems => Set<TodoItem>();
    public DbSet<TodoSubItem> TodoSubItems => Set<TodoSubItem>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<TodoItemTag> TodoItemTags => Set<TodoItemTag>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.UseOpenIddict();

        builder.Entity<TodoList>()
            .HasMany(l => l.Items)
            .WithOne(i => i.TodoList)
            .HasForeignKey(i => i.TodoListId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<TodoItem>()
            .HasMany(i => i.SubItems)
            .WithOne(s => s.TodoItem)
            .HasForeignKey(s => s.TodoItemId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<TodoItemTag>()
            .HasKey(x => new { x.TodoItemId, x.TagId });

        builder.Entity<TodoItemTag>()
            .HasOne(x => x.TodoItem)
            .WithMany(i => i.TodoItemTags)
            .HasForeignKey(x => x.TodoItemId);

        builder.Entity<TodoItemTag>()
            .HasOne(x => x.Tag)
            .WithMany(t => t.TodoItemTags)
            .HasForeignKey(x => x.TagId);
    }
}