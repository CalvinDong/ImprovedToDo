using FluentValidation;
using Api.Exceptions;

public static class ValidationExtensions
{
  public static IServiceCollection AddValidation(this IServiceCollection services)
  {
    services.AddValidatorsFromAssemblies(AppDomain.CurrentDomain.GetAssemblies());

    return services;
  }

  public static async Task ValidateAndThrowAsync<T>( // For converting Validation Error to custom error type in for middleware
        this IValidator<T> validator,
        T instance,
        CancellationToken ct)
    {
        var result = await validator.ValidateAsync(instance, ct);

        if (!result.IsValid)
            throw new Api.Exceptions.ValidationException(result.ToDictionary());
    }
}