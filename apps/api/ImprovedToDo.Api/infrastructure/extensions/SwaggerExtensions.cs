//using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;

public static class SwaggerExtensions
{
  public static IServiceCollection AddSwaggerDocs(this IServiceCollection services)
  {
    services.AddEndpointsApiExplorer();

    services.AddSwaggerGen(options =>
    {
      options.SwaggerDoc("v1", new OpenApiInfo
      {
        Title = "Todo API",
        Version = "v1"
      });

      options.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme
      {
        Type = SecuritySchemeType.OAuth2,
        Flows = new OpenApiOAuthFlows
        {
          AuthorizationCode = new OpenApiOAuthFlow
          {
            AuthorizationUrl = new Uri("/connect/authorize", UriKind.Relative),
            TokenUrl = new Uri("/connect/token", UriKind.Relative),
            Scopes = new Dictionary<string, string>
                    {
                            { "api", "Access API" }
                    }
          }
        }
      });

      options.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
          {
            new OpenApiSecurityScheme
            {
              Reference = new OpenApiReference
              {
                  Type = ReferenceType.SecurityScheme,
                  Id = "oauth2"
              }
            },
            new[] { "api" }
          }
        });
    });

    return services;
  }
}