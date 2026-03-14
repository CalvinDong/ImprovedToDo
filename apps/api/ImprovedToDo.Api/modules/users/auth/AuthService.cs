using System.Security.Claims;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using OpenIddict.Abstractions;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;

    public AuthService(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager)
    {
        _userManager = userManager;
        _signInManager = signInManager;
    }

    public async Task<IdentityResult> RegisterAsync(RegisterRequest request)
    {
        var user = new ApplicationUser
        {
            DisplayName = request.DisplayName,
            Email = request.Email,
            UserName = request.Email
        };
        
        if (string.IsNullOrEmpty(user.DisplayName)){
            user.DisplayName = request.Email;
        }

        return await _userManager.CreateAsync(user, request.Password);
    }

    public async Task<ClaimsPrincipal> LoginAsync(LoginRequest request)
    {
        var user = await _userManager.FindByNameAsync(request.Email);
        
        if (user == null || !await _userManager.CheckPasswordAsync(user, request.Password))
        {
            return null;
        }

        var principal = await _signInManager.CreateUserPrincipalAsync(user);
        
        return principal;
    }

    public async Task<LoginResult> Auth(HttpContext context){
        var request = context.GetOpenIddictServerRequest();

        if (request is null)
        {
            return new LoginResult
            {
                Status = LoginResultStatus.InvalidInput,
                Error = "OppenIddict Request could not be retrieved."
            };
        }

        // Check whether the user already has an Identity auth cookie.
        var authenticationResult = await context.AuthenticateAsync(IdentityConstants.ApplicationScheme);

        // If the user is not logged in, send them to the login page.
        if (!authenticationResult.Succeeded)
        {
            return new LoginResult
            {
                Status = LoginResultStatus.LoginRequired,
            };
        }

        // Retrieve the user represented by the cookie principal.
        var user = await _userManager.GetUserAsync(authenticationResult.Principal!);

        if (user is null)
        {
            return new LoginResult
            {
                Status = LoginResultStatus.AccessDenied,
            };
        }

        // Create the principal that OpenIddict will use to generate tokens/code.
        var principal = await _signInManager.CreateUserPrincipalAsync(user);
        
        principal.SetClaim(OpenIddictConstants.Claims.Subject, user.Id);
        principal.SetClaim(OpenIddictConstants.Claims.Name, user.DisplayName);

        // Copy the scopes requested by the client, e.g. "api".
        principal.SetScopes(request.GetScopes());

        // Optional but strongly recommended: control which claims go where.
        /*foreach (var claim in principal.Claims)
        {
            claim.SetDestinations(ClaimsHelper.GetDestinations(claim, principal));
        }*/

        return new LoginResult
        {
            Status = LoginResultStatus.Authenticated,
            Principal = principal
        };
    }
}