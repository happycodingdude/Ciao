using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace MyConnect.Authentication
{
    public class JwtToken
    {
        public static string GenerateToken(string secretKey, string username, string password)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(secretKey);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    //new Claim(ClaimTypes.Role, "admin"),
                    new Claim("username", username)
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            // Generate the JWT token
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var jwtToken = tokenHandler.WriteToken(token);
            return jwtToken;
        }

        public static object? ExtractToken(string jwtToken)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            // Read and validate the JWT token
            var token = tokenHandler.ReadJwtToken(jwtToken);

            var username = token.Claims.FirstOrDefault(q => q.Type.Equals("username")).Value;

            return new { Username = username };
        }
    }
}