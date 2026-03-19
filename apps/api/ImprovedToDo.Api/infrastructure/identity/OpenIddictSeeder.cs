using Microsoft.Extensions.DependencyInjection;
using OpenIddict.Abstractions;

public static class OpenIddictSeeder
{
    public static async Task SeedClients(IServiceProvider provider)
    {
        var manager = provider.GetRequiredService<IOpenIddictApplicationManager>();

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
                new Uri("https://localhost:5231/swagger/oauth2-redirect.html")
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
                new Uri("http://localhost:5173/auth/callback")
            },

            PostLogoutRedirectUris =
            {
                new Uri("http://localhost:5173/")
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
    
    }
}