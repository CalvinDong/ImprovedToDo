var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddDatabase(builder.Configuration)
    .AddIdentityServices()
    .AddOpenIddictServices()
    .AddValidation()
    .AddSwaggerDocs()
    .RegisterModules();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
  app.UseSwagger();

  app.UseSwaggerUI(options =>
  {
    options.OAuthClientId("swagger");
    options.OAuthUsePkce();
  });
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapEndpoints();

app.Run();