namespace Application.Jwt;

public interface IJwtService
{
    string GenerateToken(string userId);
    (string, DateTime) GenerateRefreshToken();
    bool ValidateToken(string token, out ClaimsPrincipal? principal);
}