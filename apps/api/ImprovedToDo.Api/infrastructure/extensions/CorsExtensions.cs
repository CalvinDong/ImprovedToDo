public static class CorsExtensions
{
    public static IServiceCollection AddCors(this IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy("SpaCors", policy =>
            {
                policy.WithOrigins("http://localhost:5173", "https://localhost:5173")
                      .AllowAnyHeader()
                      .AllowAnyMethod();
            });
        });
        
        return services;
    }
}