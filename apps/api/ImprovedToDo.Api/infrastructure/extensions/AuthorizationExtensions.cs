using OpenIddict.Validation.AspNetCore;

public static class AuthorizationExtensons
{
    public static IServiceCollection AddAuthorization(this IServiceCollection services)
    {
        services.AddAuthorization(options =>
        {
            options.AddPolicy("ApiPolicy", policy =>
            {
                policy.AuthenticationSchemes.Add(OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme);
                policy.RequireAuthenticatedUser();
            });
        });
        
        return services;
    }
}