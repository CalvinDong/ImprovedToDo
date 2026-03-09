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
        options.Password.RequireDigit = true;
        options.Password.RequireNonAlphanumeric = true;
        options.Password.RequiredLength = 8;
        options.User.RequireUniqueEmail = true;
      })
      .AddEntityFrameworkStores<AppDbContext>()
      .AddSignInManager();

    return services;
  }
}