namespace Chat.API.Authentication;

public class JwtToken
{
    public static Guid ExtractToken(string jwtToken)
    {
        // var tokenHandler = new JwtSecurityTokenHandler();
        // // Read and validate the JWT token
        // var token = tokenHandler.ReadJwtToken(jwtToken);
        // var id = token.Claims.FirstOrDefault(q => q.Type.Equals("userId")).Value;
        // return Guid.Parse(id);
        return Guid.Empty;
    }
}