public class JwtService : IJwtService
{
    const string secretKey = "dPLc8k9r8RJAMDfw1YgMujHu6YcJtAc3gPeTGmER"; // Use a secure key from configuration
    const string issuer = "https://chat.happycoding.click";
    const string audience = "https://chat.happycoding.click";

    public string GenerateToken(string userId)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim("UserId", userId),
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(5),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public (string, DateTime) GenerateRefreshToken()
    {
        return (Convert.ToBase64String(RandomNumberGenerator.GetBytes(128)), DateTime.Now.AddDays(7));
    }

    public bool ValidateToken(string token, out ClaimsPrincipal? principal)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

        var tokenHandler = new JwtSecurityTokenHandler();
        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = key,
            ClockSkew = TimeSpan.Zero
        };

        try
        {
            principal = tokenHandler.ValidateToken(token, validationParameters, out _);
            Console.WriteLine($"Token validated");
            return true;
        }
        catch (SecurityTokenExpiredException ex)
        {
            Console.WriteLine($"Token expired at {ex.Expires}");
        }
        catch (SecurityTokenException ex)
        {
            Console.WriteLine($"Token validation failed: {ex.Message}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Unexpected error: {ex.Message}");
        }

        principal = null;
        return false;
    }
}