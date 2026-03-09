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
      // Need to configure logout

      options.AllowAuthorizationCodeFlow()
                 .RequireProofKeyForCodeExchange();
      
      options.AllowRefreshTokenFlow();

      // Set token lifetimes
      options.SetAccessTokenLifetime(TimeSpan.FromMinutes(30)); // Short-lived access tokens
      options.SetRefreshTokenLifetime(TimeSpan.FromDays(7));    // Longer-lived refresh tokens

      options.RegisterScopes(
                OpenIddictConstants.Scopes.OpenId,
                OpenIddictConstants.Scopes.Profile,
                OpenIddictConstants.Scopes.OfflineAccess,
                "api"
            );

      options.AddDevelopmentEncryptionCertificate()
                 .AddDevelopmentSigningCertificate();

      options.UseAspNetCore()
                 .EnableAuthorizationEndpointPassthrough();
    })

    .AddValidation(options =>
    {
      options.UseLocalServer();
      options.UseAspNetCore();
    });

    return services;
  }
}