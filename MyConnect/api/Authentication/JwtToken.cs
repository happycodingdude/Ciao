using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using MyConnect.Model;

namespace MyConnect.Authentication
{
    public class JwtToken
    {
        public static string GenerateToken(string secretKey, Contact user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(secretKey);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    //new Claim(ClaimTypes.Role, "admin"),
                    new Claim("id", user.Id.ToString()),
                    new Claim("username", user.Username)
                }),
                Expires = DateTime.UtcNow.AddHours(8),
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
            var id = token.Claims.FirstOrDefault(q => q.Type.Equals("id")).Value;

            return new { Id = id, Username = username };
        }
    }
}