using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using System.Security.Claims;

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

public class ApplicationUserClaimsPrincipalFactory : UserClaimsPrincipalFactory<ApplicationUser>
{
  public ApplicationUserClaimsPrincipalFactory(
          UserManager<ApplicationUser> userManager,
          IOptions<IdentityOptions> optionsAccessor
        )
         : base(userManager, optionsAccessor)
  {
  }

  protected override async Task<ClaimsIdentity> GenerateClaimsAsync(ApplicationUser user)
  {
      var identity = await base.GenerateClaimsAsync(user);

      var existingNameClaim = identity.FindFirst(ClaimTypes.Name);
      if (existingNameClaim is not null)
      {
          identity.RemoveClaim(existingNameClaim);
      }

      identity.AddClaim(new Claim(ClaimTypes.Name, user.DisplayName ?? user.Email ?? user.UserName ?? ""));

      return identity;
  }
}