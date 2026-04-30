namespace Infrastructure.Jwt;

public class JwtService : IJwtService
{
    readonly JwtSettings _settings;
    readonly ILogger _logger;

    public JwtService(IOptions<JwtSettings> settings, ILogger logger)
    {
        _settings = settings.Value;
        _logger = logger;
    }

    public string GenerateToken(string userId)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.SecretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim("UserId", userId),
        };

        var token = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(_settings.AccessTokenExpirationHours),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public (string, DateTime) GenerateRefreshToken()
    {
        return (Convert.ToBase64String(RandomNumberGenerator.GetBytes(128)), DateTime.UtcNow.AddDays(_settings.RefreshTokenExpirationDays));
    }

    public bool ValidateToken(string token, out ClaimsPrincipal? principal)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.SecretKey));

        var tokenHandler = new JwtSecurityTokenHandler();
        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = _settings.Issuer,
            ValidAudience = _settings.Audience,
            IssuerSigningKey = key,
            ClockSkew = TimeSpan.Zero
        };

        try
        {
            principal = tokenHandler.ValidateToken(token, validationParameters, out _);
            return true;
        }
        catch (SecurityTokenExpiredException ex)
        {
            _logger.Error($"Token expired at {ex.Expires}");
        }
        catch (SecurityTokenException ex)
        {
            _logger.Error($"Token validation failed: {ex.Message}");
        }
        catch (Exception ex)
        {
            _logger.Error($"Unexpected error during token validation: {ex.Message}");
        }

        principal = null;
        return false;
    }
}
