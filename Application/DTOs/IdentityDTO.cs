namespace Application.DTOs;

public class AuthenticationUser : IdentityUser { }

public class IdentityRequest
{
    public string Name { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string Password { get; set; } = null!;
}