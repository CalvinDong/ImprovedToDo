public static class CorsExtensions
{
    public static IServiceCollection AddCors(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var spaUrl = configuration["ApplicationUrls:Spa"]
            ?? throw new InvalidOperationException(
                "ApplicationUrls:Spa must be configured.");

        services.AddCors(options =>
        {
            options.AddPolicy("SpaCors", policy =>
            {
                policy.WithOrigins(spaUrl.TrimEnd('/'))
                      .AllowAnyHeader()
                      .AllowAnyMethod();
            });
        });
        
        return services;
    }
}
