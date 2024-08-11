namespace Application.DTOs;

public class AuthenticationUser : IdentityUser { }

public class IdentityRequest
{
    public string Name { get; set; }
    public string Username { get; set; }
    public string Password { get; set; }
}

public class CreateContact
{
    public string Id { get; set; }
    public string Name { get; set; }
}

public class SignInResponse
{
    public string tokenType { get; set; }
    public string accessToken { get; set; }
    public int expiresIn { get; set; }
    public string refreshToken { get; set; }
}

public class AppUser
{
    public string id { get; set; }
    public string userName { get; set; }
    public string normalizedUserName { get; set; }
    public string email { get; set; }
    public string normalizedEmail { get; set; }
    public bool? emailConfirmed { get; set; }
    public string passwordHash { get; set; }
    public string securityStamp { get; set; }
    public string concurrencyStamp { get; set; }
    public string phoneNumber { get; set; }
    public bool? phoneNumberConfirmed { get; set; }
    public bool? twoFactorEnabled { get; set; }
    public DateTime? lockoutEnd { get; set; }
    public bool? lockoutEnabled { get; set; }
    public int accessFailedCount { get; set; }
}