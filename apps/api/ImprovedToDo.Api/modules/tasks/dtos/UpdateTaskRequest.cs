using FluentValidation;

namespace Api.Dtos.Tasks;

public sealed class UpdateTaskRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }

    // lets you distinguish "not provided" vs "set to null"
    public bool DueDateSet { get; set; }
    public DateTimeOffset? DueDate { get; set; }

    public bool? Completed { get; set; }
    public Guid? TodoListId { get; set; }
}

public class UpdateTaskValidator : AbstractValidator<UpdateTaskRequest>
{
    public UpdateTaskValidator()
    {
        RuleFor(x => x.Title)
            .MaximumLength(200);
        RuleFor(x => x.Description)
            .MaximumLength(2000);
    }
}
