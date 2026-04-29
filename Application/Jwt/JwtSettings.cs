namespace Application.Jwt;

public class JwtSettings
{
    public string SecretKey { get; set; } = null!;
    public string Issuer { get; set; } = null!;
    public string Audience { get; set; } = null!;
    public int AccessTokenExpirationHours { get; set; } = 1;
    public int RefreshTokenExpirationDays { get; set; } = 7;
}
