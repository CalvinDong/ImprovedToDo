using FluentValidation;

namespace Api.Dtos.Tasks;

public sealed class CreateTaskRequest
{
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public DateTimeOffset? DueDate { get; set; }
    public Guid? TodoListId { get; set; }
    public string LexoRank { get; set; }
}

public class CreateTaskValidator : AbstractValidator<CreateTaskRequest>
{
    public CreateTaskValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .MaximumLength(200);
        RuleFor(x => x.Description)
            .MaximumLength(2000);
        RuleFor(x => x.LexoRank)
            .NotNull();
    }
}
