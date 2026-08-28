using Api.Dtos.Tasks;
using Api.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace ImprovedToDo.Api.Tests;

public sealed class TaskServiceTests : IAsyncLifetime
{
    private readonly TestDatabase _database = new();
    private TaskService _service = null!;

    public async Task InitializeAsync()
    {
        await _database.InitializeAsync();
        _service = new TaskService(_database.Context);
        await EnsureUserExists("user-1");
    }

    public Task DisposeAsync() => _database.DisposeAsync().AsTask();

    [Fact]
    public async Task CreateTask_PersistsTaskForUserAsIncomplete()
    {
        var result = await _service.CreateTask(new CreateTaskRequest
        {
            Title = "Write tests",
            Description = "Backend coverage",
            LexoRank = "n"
        }, "user-1", default);

        var stored = await _database.Context.TodoItems.SingleAsync();
        Assert.Equal(result.Id, stored.Id);
        Assert.Equal("Write tests", stored.Title);
        Assert.Equal("user-1", stored.UserId);
        Assert.False(stored.Completed);
    }

    [Fact]
    public async Task UpdateTask_ChangesProvidedFieldsAndPersistsThem()
    {
        var task = await SeedTask("user-1", "Original", "n");

        var result = await _service.UpdateTasks(new UpdateTaskRequest
        {
            Title = "Edited",
            Description = "Changed",
            Completed = true
        }, task.Id, "user-1", default);

        Assert.Equal("Edited", result!.Title);
        Assert.Equal("Changed", result.Description);
        Assert.True(result.Completed);
        Assert.NotNull(result.UpdatedAtUtc);
        Assert.Equal("Edited", (await _database.Context.TodoItems.FindAsync(task.Id))!.Title);
    }

    [Fact]
    public async Task DeleteTask_RemovesTaskFromDatabase()
    {
        var task = await SeedTask("user-1", "Delete me", "n");

        await _service.DeleteTasks(task.Id, "user-1", default);

        Assert.False(await _database.Context.TodoItems.AnyAsync(x => x.Id == task.Id));
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task SetTaskComplete_PersistsRequestedState(bool completed)
    {
        var task = await SeedTask("user-1", "Toggle", "n", !completed);

        var result = await _service.SetTasksComplete(
            new SetTaskCompleteRequest { Completed = completed }, task.Id, "user-1", default);

        Assert.Equal(completed, result.Completed);
        Assert.Equal(completed, (await _database.Context.TodoItems.FindAsync(task.Id))!.Completed);
    }

    [Fact]
    public async Task UpdatePosition_BetweenTwoTasks_AssignsRankBetweenNeighbours()
    {
        var before = await SeedTask("user-1", "Before", "a");
        var moving = await SeedTask("user-1", "Moving", "z");
        var after = await SeedTask("user-1", "After", "y");

        var result = await _service.UpdateTasksPosition(new UpdateTaskPositionRequest
        {
            BeforeTaskId = before.Id,
            AfterTaskId = after.Id
        }, moving.Id, "user-1", default);

        Assert.True(string.CompareOrdinal(before.LexoRank, result.LexoRank) < 0);
        Assert.True(string.CompareOrdinal(result.LexoRank, after.LexoRank) < 0);
        Assert.Equal(result.LexoRank, (await _database.Context.TodoItems.FindAsync(moving.Id))!.LexoRank);
    }

    [Fact]
    public async Task UpdatePosition_BeforeFirstTask_AssignsLowerRank()
    {
        var moving = await SeedTask("user-1", "Moving", "z");
        var after = await SeedTask("user-1", "First", "n");

        var result = await _service.UpdateTasksPosition(
            new UpdateTaskPositionRequest { AfterTaskId = after.Id }, moving.Id, "user-1", default);

        Assert.True(string.CompareOrdinal(result.LexoRank, after.LexoRank) < 0);
    }

    [Fact]
    public async Task UpdatePosition_AfterLastTask_AssignsHigherRank()
    {
        var before = await SeedTask("user-1", "Last", "n");
        var moving = await SeedTask("user-1", "Moving", "a");

        var result = await _service.UpdateTasksPosition(
            new UpdateTaskPositionRequest { BeforeTaskId = before.Id }, moving.Id, "user-1", default);

        Assert.True(string.CompareOrdinal(result.LexoRank, before.LexoRank) > 0);
    }

    [Fact]
    public async Task UpdatePosition_RelativeToItself_IsRejected()
    {
        var task = await SeedTask("user-1", "Task", "n");

        await Assert.ThrowsAsync<ValidationException>(() => _service.UpdateTasksPosition(
            new UpdateTaskPositionRequest { BeforeTaskId = task.Id }, task.Id, "user-1", default));
    }

    [Fact]
    public async Task GetTasks_ReturnsOnlyCurrentUsersTasks()
    {
        await SeedTask("user-1", "Mine", "a");
        await SeedTask("user-2", "Theirs", "b");

        var results = (await _service.GetTasks(new GetTasksQuery(), "user-1", default)).ToList();

        var task = Assert.Single(results);
        Assert.Equal("Mine", task.Title);
    }

    [Fact]
    public async Task GetAnotherUsersTask_ReturnsNotFoundWithoutLeakingIt()
    {
        var task = await SeedTask("owner", "Private", "n");

        await Assert.ThrowsAsync<NotFoundException>(
            () => _service.GetTaskById(task.Id, "intruder", default));
    }

    [Theory]
    [InlineData("update")]
    [InlineData("delete")]
    [InlineData("complete")]
    [InlineData("move")]
    public async Task MutatingAnotherUsersTask_ReturnsNotFoundAndLeavesTaskUnchanged(string operation)
    {
        var task = await SeedTask("owner", "Private", "n");

        Task action = operation switch
        {
            "update" => _service.UpdateTasks(new UpdateTaskRequest { Title = "Hacked" }, task.Id, "intruder", default),
            "delete" => _service.DeleteTasks(task.Id, "intruder", default),
            "complete" => _service.SetTasksComplete(new SetTaskCompleteRequest { Completed = true }, task.Id, "intruder", default),
            _ => _service.UpdateTasksPosition(new UpdateTaskPositionRequest(), task.Id, "intruder", default)
        };

        await Assert.ThrowsAsync<NotFoundException>(() => action);
        _database.Context.ChangeTracker.Clear();
        var unchanged = await _database.Context.TodoItems.SingleAsync(x => x.Id == task.Id);
        Assert.Equal("Private", unchanged.Title);
        Assert.False(unchanged.Completed);
        Assert.Equal("n", unchanged.LexoRank);
    }

    [Fact]
    public async Task GetTasks_CanFilterByCompletionAndSearchText()
    {
        await SeedTask("user-1", "Matching completed task", "b", true);
        await SeedTask("user-1", "Matching open task", "a", false);
        await SeedTask("user-1", "Unrelated", "c", true);

        var results = (await _service.GetTasks(new GetTasksQuery
        {
            Completed = true,
            Search = "Matching"
        }, "user-1", default)).ToList();

        var task = Assert.Single(results);
        Assert.Equal("Matching completed task", task.Title);
    }

    private async Task<TodoItem> SeedTask(
        string userId,
        string title,
        string rank,
        bool completed = false,
        Guid? listId = null)
    {
        await EnsureUserExists(userId);
        var task = new TodoItem
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = title,
            LexoRank = rank,
            Completed = completed,
            TodoListId = listId,
            CreatedAt = DateTimeOffset.UtcNow
        };
        _database.Context.TodoItems.Add(task);
        await _database.Context.SaveChangesAsync();
        return task;
    }

    private async Task EnsureUserExists(string userId)
    {
        if (await _database.Context.Users.AnyAsync(x => x.Id == userId))
            return;

        _database.Context.Users.Add(new ApplicationUser
        {
            Id = userId,
            UserName = $"{userId}@example.com",
            NormalizedUserName = $"{userId}@example.com".ToUpperInvariant(),
            Email = $"{userId}@example.com",
            NormalizedEmail = $"{userId}@example.com".ToUpperInvariant(),
            DisplayName = userId
        });
        await _database.Context.SaveChangesAsync();
    }
}
