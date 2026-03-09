using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        var logger = services.GetRequiredService<ILoggerFactory>()
            .CreateLogger("DbSeeder");

        try
        {
            var db = services.GetRequiredService<AppDbContext>();

            // Apply migrations automatically
            await db.Database.MigrateAsync();

            // Seed OpenIddict clients
            await OpenIddictSeeder.SeedClients(services);

            // Optional: seed users/roles
            await IdentitySeeder.SeedUsers(services);

            logger.LogInformation("Database seeding completed");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Database seeding failed");
            throw;
        }
    }
}