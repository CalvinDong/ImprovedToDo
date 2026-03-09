using Microsoft.AspNetCore.Identity;
using OpenIddict.Server.AspNetCore;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Authentication;

public class AuthModule : IModule
{
  public IServiceCollection RegisterModule(IServiceCollection services)
  {
    services.AddScoped<IAuthService, AuthService>();
    services.AddScoped<SignInManager<ApplicationUser>, SignInManager<ApplicationUser>>();
    return services;
  }

    public IEndpointRouteBuilder MapEndpoints(IEndpointRouteBuilder endpoints)
    {
      var group = endpoints.MapGroup("/auth");

      // REGISTER
      group.MapPost("/register", async (RegisterRequest request, IAuthService authService) =>
      {
        var result = await authService.RegisterAsync(request);

        if (!result.Succeeded) 
          return Results.BadRequest(result.Errors);

        return Results.Ok("User created");
      });

        endpoints.MapGet("/login", (HttpContext context) =>
        {
          var returnUrl = context.Request.Query["ReturnUrl"];

          var html = $"""
          <html>
              <body>
                  <h2>Login</h2>
                  <form method="post" action="/login">
                      <input type="hidden" name="returnUrl" value="{returnUrl}" />
                        
                      <label>Username</label><br/>
                      <input name="username" /><br/>

                      <label>Password</label><br/>
                      <input name="password" type="password"/><br/><br/>

                      <button type="submit">Login</button>
                  </form>
              </body>
          </html>
          """;

          return Results.Content(html, "text/html");
        });

        endpoints.MapPost("/login", async (HttpContext context, SignInManager<ApplicationUser> signInManager) =>
        {
          var form = await context.Request.ReadFormAsync();

          var username = form["username"].ToString();
          var password = form["password"].ToString();
          var returnUrl = form["returnUrl"].ToString();

          var result = await signInManager.PasswordSignInAsync(
              username,
              password,
              isPersistent: false,
              lockoutOnFailure: false);

          if (!result.Succeeded)
          {
            return Results.Content("Invalid username or password.", "text/plain");
          }

          if (string.IsNullOrWhiteSpace(returnUrl))
            {
              return Results.Redirect("/");
            }

          return Results.Redirect(returnUrl);
        });

        
        endpoints.MapMethods("/connect/authorize", new[] { "GET", "POST" }, async (IAuthService authService, HttpContext context) =>
        {
          var result = await authService.Auth(context);
          
          return result.Status switch {
            LoginResultStatus.Authenticated => 
              Results.SignIn(result.Principal!, authenticationScheme: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme),

            LoginResultStatus.InvalidInput => 
              Results.BadRequest(new { error = result.Error}),

            LoginResultStatus.AccessDenied => 
              Results.Forbid(authenticationSchemes: new[] { OpenIddictServerAspNetCoreDefaults.AuthenticationScheme }),

            LoginResultStatus.LoginRequired => 
              Results.Challenge(
                  authenticationSchemes: new[] { IdentityConstants.ApplicationScheme },
                  properties: new AuthenticationProperties
                  {
                    RedirectUri = context.Request.PathBase +
                                  context.Request.Path +
                                  context.Request.QueryString
                }
              ),

              LoginResultStatus.ExternalLoginRequired => 
                  Results.Challenge(
                  authenticationSchemes: new[]
                  {
                      result.AuthenticationScheme!
                  }),

              _ => Results.Problem("Unexpected result.")
            };
          });
        
        endpoints.MapPost("/logout", async (HttpContext context) =>
        {
            await context.SignOutAsync(IdentityConstants.ApplicationScheme);
            return Results.Redirect("/");
        });

        endpoints.MapMethods("/connect/logout", new[] { "GET", "POST" }, async (HttpContext context) =>
        {
          var request = context.GetOpenIddictServerRequest();

          await context.SignOutAsync(IdentityConstants.ApplicationScheme);

          if (!string.IsNullOrWhiteSpace(request?.PostLogoutRedirectUri))
          {
              return Results.Redirect(request.PostLogoutRedirectUri);
          }

          return Results.Redirect("/");
        });

        endpoints.MapGet("/secure", async(HttpContext context) =>
        {
          return Results.Ok(new
          {
            context.Request.Path,
            Authenticated = context.User.Identity?.IsAuthenticated ?? false,
            username = context.User.Identity?.Name,
            Claims = context.User.Claims.Select(c => new { c.Type, c.Value })
          });
        });

        return endpoints;
    }
}