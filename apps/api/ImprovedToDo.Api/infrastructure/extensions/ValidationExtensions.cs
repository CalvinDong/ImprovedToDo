using FluentValidation;

public static class ValidationExtensions
{
  public static IServiceCollection AddValidation(this IServiceCollection services)
  {
    services.AddValidatorsFromAssemblies(AppDomain.CurrentDomain.GetAssemblies());

    return services;
  }
}