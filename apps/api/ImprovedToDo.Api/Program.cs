using Microsoft.AspNetCore.Identity;

var builder = WebApplication.CreateBuilder(args);


builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultScheme = IdentityConstants.ApplicationScheme;
    })
    .AddCookie(IdentityConstants.ApplicationScheme, options =>
    {
        options.LoginPath = "/login";
        options.LogoutPath = "/logout";
    });

builder.Services.AddScoped<IUserClaimsPrincipalFactory<ApplicationUser>, ApplicationUserClaimsPrincipalFactory>();
builder.Services.AddRazorPages();
builder.Services.AddAuthorization();

builder.Services
    .AddDatabase(builder.Configuration)
    .AddIdentityServices()
    .AddOpenIddictServices()
    .AddValidation()
    .AddSwaggerDocs()
    .RegisterModules();


var app = builder.Build();

app.UseGlobalExceptionHandling();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    await DbSeeder.SeedAsync(services);
}

if (app.Environment.IsDevelopment())
{
  app.UseSwagger();

  app.UseSwaggerUI(options =>
  {
    options.OAuthClientId("swagger");
    options.OAuthScopes("api", "offline_access");
    options.OAuthUsePkce();
  });
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapRazorPages();

app.MapGet("/", () => "Server running");

app.MapEndpoints();

app.Run();