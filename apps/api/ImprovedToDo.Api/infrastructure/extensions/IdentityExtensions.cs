using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

public static class IdentityExtensions
{
  public static IServiceCollection AddIdentityServices(this IServiceCollection services)
  {
    services
        .AddIdentityCore<ApplicationUser>(options =>
        {
          options.Password.RequireDigit = false;
          options.Password.RequireUppercase = false;
        })
        .AddEntityFrameworkStores<AppDbContext>()
        .AddSignInManager();

    return services;
  }
}