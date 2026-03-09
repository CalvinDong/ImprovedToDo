using System.Security.Claims;
using Microsoft.AspNetCore.Identity;

public interface IAuthService
{
    Task<IdentityResult> RegisterAsync(RegisterRequest request);
    Task<ClaimsPrincipal> LoginAsync(LoginRequest request);
    Task<LoginResult> Auth(HttpContext context);
}