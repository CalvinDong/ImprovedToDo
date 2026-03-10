public class RegisterRequest
{
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
    public string DisplayName { get; set; } = "";
}

public class LoginRequest
{
    public string Email { get; set; } = ""; // Also allow to do by email?
    public string Password { get; set; } = "";
}

// Add Edit and Delete later