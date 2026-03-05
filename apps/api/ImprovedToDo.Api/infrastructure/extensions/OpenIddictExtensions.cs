using OpenIddict.Abstractions;

public static class OpenIddictExtensions
{
  public static IServiceCollection AddOpenIddictServices(this IServiceCollection services)
  {
    services.AddOpenIddict()

    .AddCore(options =>
    {
      options.UseEntityFrameworkCore()
                 .UseDbContext<AppDbContext>();
    })

    .AddServer(options =>
    {
      options.SetAuthorizationEndpointUris("/connect/authorize");
      options.SetTokenEndpointUris("/connect/token");

      options.AllowAuthorizationCodeFlow()
                 .RequireProofKeyForCodeExchange();

      options.RegisterScopes("api");

      options.AddDevelopmentEncryptionCertificate()
                 .AddDevelopmentSigningCertificate();

      options.UseAspNetCore()
                 .EnableAuthorizationEndpointPassthrough()
                 .EnableTokenEndpointPassthrough();
    })

    .AddValidation(options =>
    {
      options.UseLocalServer();
      options.UseAspNetCore();
    });

    return services;
  }
}