namespace Application.DTOs;

public class AuthenticationUser : IdentityUser { }

public class IdentityRequest
{
    public string Name { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string Password { get; set; } = null!;
}

public class TokenModel
{
    public string AccessToken { get; set; } = null!;
    public string RefreshToken { get; set; } = null!;
    public string UserId { get; set; } = null!;

    public TokenModel(string accessToken, string refreshToken, string userId)
    {
        AccessToken = accessToken;
        RefreshToken = refreshToken;
        UserId = userId;
    }
}

public class RefreshTokenRequest
{
    public string UserId { get; set; } = null!;
    public string RefreshToken { get; set; } = null!;
}