using System.Security.Claims;

public enum LoginResultStatus
{
    Authenticated,
    InvalidInput,
    AccessDenied,
    LoginRequired,
    ExternalLoginRequired
}

public sealed class LoginResult
{
    public LoginResultStatus Status { get; init; }
    public ClaimsPrincipal? Principal { get; init; }
    public string? Error { get; init; }
    public string? AuthenticationScheme { get; init; }
}