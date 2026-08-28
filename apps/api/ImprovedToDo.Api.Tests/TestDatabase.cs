using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace ImprovedToDo.Api.Tests;

internal sealed class TestDatabase : IAsyncDisposable
{
    private readonly SqliteConnection _connection = new("Data Source=:memory:");

    public AppDbContext Context { get; private set; } = null!;

    public async Task InitializeAsync()
    {
        await _connection.OpenAsync();
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(_connection)
            .Options;

        Context = new SqliteTestDbContext(options);
        await Context.Database.EnsureCreatedAsync();
    }

    public async ValueTask DisposeAsync()
    {
        await Context.DisposeAsync();
        await _connection.DisposeAsync();
    }

    private sealed class SqliteTestDbContext : AppDbContext
    {
        public SqliteTestDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            builder.Entity<TodoItem>()
                .Property(x => x.CreatedAt)
                .HasConversion(
                    value => value.UtcTicks,
                    value => new DateTimeOffset(value, TimeSpan.Zero));
        }
    }
}
