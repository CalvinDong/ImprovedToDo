using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using OpenIddict.Validation.AspNetCore;
using System.Net;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text.Encodings.Web;
using Api.Dtos.Tasks;

namespace ImprovedToDo.Api.Tests;

public sealed class AuthTests : IAsyncLifetime
{
    private readonly TestDatabase _database = new();
    private ServiceProvider _services = null!;
    private IAuthService _authService = null!;

    public async Task InitializeAsync()
    {
        await _database.InitializeAsync();

        var services = new ServiceCollection();
        services.AddLogging();
        services.AddAuthentication(IdentityConstants.ApplicationScheme)
            .AddCookie(IdentityConstants.ApplicationScheme);
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlite(_database.Context.Database.GetDbConnection()));
        services.AddIdentityCore<ApplicationUser>(options =>
            {
                options.Password.RequireDigit = true;
                options.Password.RequireNonAlphanumeric = true;
                options.Password.RequiredLength = 8;
                options.User.RequireUniqueEmail = true;
            })
            .AddEntityFrameworkStores<AppDbContext>()
            .AddSignInManager();
        services.AddScoped<IUserClaimsPrincipalFactory<ApplicationUser>, ApplicationUserClaimsPrincipalFactory>();
        services.AddScoped<IAuthService, AuthService>();

        _services = services.BuildServiceProvider();
        _authService = _services.GetRequiredService<IAuthService>();
    }

    public async Task DisposeAsync()
    {
        await _services.DisposeAsync();
        await _database.DisposeAsync();
    }

    [Fact]
    public async Task Register_WithValidDetails_CreatesUser()
    {
        var result = await _authService.RegisterAsync(new RegisterRequest
        {
            Email = "new@example.com",
            Password = "Strong!1Password",
            DisplayName = "New User"
        });

        Assert.True(result.Succeeded);
        var stored = await _services.GetRequiredService<UserManager<ApplicationUser>>()
            .FindByEmailAsync("new@example.com");
        Assert.NotNull(stored);
        Assert.Equal("New User", stored.DisplayName);
    }

    [Theory]
    [InlineData("invalid user@example.com", "Strong!1Password")]
    [InlineData("weak@example.com", "weak")]
    public async Task Register_WithInvalidCredentials_ReturnsIdentityErrors(string email, string password)
    {
        var result = await _authService.RegisterAsync(new RegisterRequest
        {
            Email = email,
            Password = password
        });

        Assert.False(result.Succeeded);
        Assert.NotEmpty(result.Errors);
    }

    [Fact]
    public async Task Login_WithCorrectCredentials_ReturnsAuthenticatedPrincipal()
    {
        await RegisterUser("login@example.com", "Strong!1Password");

        var principal = await _authService.LoginAsync(new LoginRequest
        {
            Email = "login@example.com",
            Password = "Strong!1Password"
        });

        Assert.NotNull(principal);
        Assert.True(principal.Identity?.IsAuthenticated);
        Assert.NotNull(principal.FindFirstValue(ClaimTypes.NameIdentifier));
    }

    [Theory]
    [InlineData("login@example.com", "Wrong!1Password")]
    [InlineData("missing@example.com", "Strong!1Password")]
    public async Task Login_WithWrongCredentials_ReturnsNull(string email, string password)
    {
        await RegisterUser("login@example.com", "Strong!1Password");

        var principal = await _authService.LoginAsync(new LoginRequest
        {
            Email = email,
            Password = password
        });

        Assert.Null(principal);
    }

    [Fact]
    public async Task RestrictedTasksEndpoint_WithoutToken_ReturnsUnauthorized()
    {
        await using var app = await CreateRestrictedTasksApp();

        var response = await app.GetTestClient().GetAsync("/tasks/");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task RestrictedTasksEndpoint_WithValidToken_ReturnsUsersTasks()
    {
        await using var app = await CreateRestrictedTasksApp();
        var client = app.GetTestClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "valid-token");

        var response = await client.GetAsync("/tasks/");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("Authenticated user's task", json);
    }

    private async Task RegisterUser(string email, string password)
    {
        var result = await _authService.RegisterAsync(new RegisterRequest
        {
            Email = email,
            Password = password,
            DisplayName = "Test User"
        });
        Assert.True(result.Succeeded);
    }

    private static async Task<WebApplication> CreateRestrictedTasksApp()
    {
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseTestServer();
        builder.Services.AddLogging();
        builder.Services.AddAuthentication(TestTokenHandler.SchemeName)
            .AddScheme<AuthenticationSchemeOptions, TestTokenHandler>(TestTokenHandler.SchemeName, null);
        builder.Services.AddAuthorization(options =>
        {
            options.AddPolicy("ApiPolicy", policy =>
            {
                policy.AuthenticationSchemes.Add(TestTokenHandler.SchemeName);
                policy.RequireAuthenticatedUser();
            });
        });
        builder.Services.AddSingleton<ITaskService, EndpointTaskService>();
        builder.Services.AddSingleton<FluentValidation.IValidator<CreateTaskRequest>, CreateTaskValidator>();
        builder.Services.AddSingleton<FluentValidation.IValidator<UpdateTaskRequest>, UpdateTaskValidator>();

        var app = builder.Build();
        app.UseAuthentication();
        app.UseAuthorization();
        new TasksModule().MapEndpoints(app);
        await app.StartAsync();
        return app;
    }

    private sealed class TestTokenHandler : AuthenticationHandler<AuthenticationSchemeOptions>
    {
        public const string SchemeName = OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme;

        public TestTokenHandler(
            IOptionsMonitor<AuthenticationSchemeOptions> options,
            ILoggerFactory logger,
            UrlEncoder encoder) : base(options, logger, encoder) { }

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            if (Request.Headers.Authorization != "Bearer valid-token")
                return Task.FromResult(AuthenticateResult.NoResult());

            var identity = new ClaimsIdentity(
                new[] { new Claim(ClaimTypes.NameIdentifier, "authenticated-user") },
                SchemeName);
            return Task.FromResult(AuthenticateResult.Success(
                new AuthenticationTicket(new ClaimsPrincipal(identity), SchemeName)));
        }
    }

    private sealed class EndpointTaskService : ITaskService
    {
        public Task<IEnumerable<TaskResponse>> GetTasks(GetTasksQuery query, string userId, CancellationToken ct)
        {
            Assert.Equal("authenticated-user", userId);
            return Task.FromResult<IEnumerable<TaskResponse>>(new[]
            {
                new TaskResponse { Id = Guid.NewGuid(), Title = "Authenticated user's task", LexoRank = "n" }
            });
        }

        public Task<TaskResponse> CreateTask(CreateTaskRequest request, string userId, CancellationToken ct) => throw new NotSupportedException();
        public Task<TaskResponse> GetTaskById(Guid id, string userId, CancellationToken ct) => throw new NotSupportedException();
        public Task<TaskResponse> UpdateTasks(UpdateTaskRequest request, Guid id, string userId, CancellationToken ct) => throw new NotSupportedException();
        public Task DeleteTasks(Guid id, string userId, CancellationToken ct) => throw new NotSupportedException();
        public Task<TaskResponse> SetTasksComplete(SetTaskCompleteRequest request, Guid id, string userId, CancellationToken ct) => throw new NotSupportedException();
        public Task<TaskResponse> UpdateTasksPosition(UpdateTaskPositionRequest request, Guid id, string userId, CancellationToken ct) => throw new NotSupportedException();
    }
}
