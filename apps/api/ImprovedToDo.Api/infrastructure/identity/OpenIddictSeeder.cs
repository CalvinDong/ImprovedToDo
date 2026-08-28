using Microsoft.Extensions.DependencyInjection;
using OpenIddict.Abstractions;

public static class OpenIddictSeeder
{
    public static async Task SeedClients(IServiceProvider provider)
    {
        var manager = provider.GetRequiredService<IOpenIddictApplicationManager>();
        var configuration = provider.GetRequiredService<IConfiguration>();
        var apiUrl = GetRequiredBaseUri(configuration, "ApplicationUrls:Api");
        var spaUrl = GetRequiredBaseUri(configuration, "ApplicationUrls:Spa");

        var swagClient = await manager.FindByClientIdAsync("swagger");
        if (swagClient != null)
        {
            await manager.DeleteAsync(swagClient);
        }
        
        await manager.CreateAsync(new OpenIddictApplicationDescriptor
        {
            ClientId = "swagger",
            DisplayName = "Swagger UI",

            RedirectUris =
            {
                new Uri(apiUrl, "/swagger/oauth2-redirect.html")
            },

            Requirements =
            {
                OpenIddictConstants.Requirements.Features.ProofKeyForCodeExchange
            },

            Permissions =
            {   
                OpenIddictConstants.Permissions.Endpoints.Authorization,
                OpenIddictConstants.Permissions.Endpoints.Token,
                OpenIddictConstants.Permissions.GrantTypes.RefreshToken,
                OpenIddictConstants.Permissions.GrantTypes.AuthorizationCode,
                OpenIddictConstants.Permissions.ResponseTypes.Code,
                OpenIddictConstants.Permissions.Scopes.Email,
                OpenIddictConstants.Permissions.Scopes.Profile,
                OpenIddictConstants.Permissions.Prefixes.Scope + "api"
            }
        });


        var reactClient = await manager.FindByClientIdAsync("react-client");
        if (reactClient != null)
        {
            await manager.DeleteAsync(reactClient);
        }

        await manager.CreateAsync(new OpenIddictApplicationDescriptor
        {
            ClientId = "react-client",
            DisplayName = "React SPA",

            RedirectUris =
            {
                new Uri(spaUrl, "/auth/callback")
            },

            PostLogoutRedirectUris =
            {
                new Uri(spaUrl, "/logout-page")
            },

            Requirements =
            {
                OpenIddictConstants.Requirements.Features.ProofKeyForCodeExchange
            },

            Permissions =
            {   
                OpenIddictConstants.Permissions.Endpoints.Authorization,
                OpenIddictConstants.Permissions.Endpoints.Token,
                OpenIddictConstants.Permissions.Endpoints.EndSession,

                OpenIddictConstants.Permissions.GrantTypes.RefreshToken,
                OpenIddictConstants.Permissions.GrantTypes.AuthorizationCode,

                OpenIddictConstants.Permissions.ResponseTypes.Code,

                OpenIddictConstants.Permissions.Scopes.Email,
                OpenIddictConstants.Permissions.Scopes.Profile,
                OpenIddictConstants.Permissions.Prefixes.Scope + "api"
            }
        });
    }

    private static Uri GetRequiredBaseUri(
        IConfiguration configuration,
        string configurationKey)
    {
        var value = configuration[configurationKey];
        if (!Uri.TryCreate(value, UriKind.Absolute, out var uri))
        {
            throw new InvalidOperationException(
                $"{configurationKey} must be configured as an absolute URL.");
        }

        return uri;
    }
}
