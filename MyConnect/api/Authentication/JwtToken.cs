using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace MyConnect.Authentication
{
    public class JwtToken
    {
        public static string GenerateToken(string secretKey, string userId)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(secretKey);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    //new Claim(ClaimTypes.Role, "admin"),
                    // new Claim("id", userId),
                    new Claim("UserId", userId),
                }),
                Expires = DateTime.UtcNow.AddDays(30),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            // Generate the JWT token
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var jwtToken = tokenHandler.WriteToken(token);
            return jwtToken;
        }

        public static Guid ExtractToken(string jwtToken)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            // Read and validate the JWT token
            var token = tokenHandler.ReadJwtToken(jwtToken);
            var id = token.Claims.FirstOrDefault(q => q.Type.Equals("UserId")).Value;
            return Guid.Parse(id);
        }
    }
}