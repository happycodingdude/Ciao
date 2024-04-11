namespace MyConnect.Model
{
    public class LoginRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    public class LoginResponse
    {
        public string tokenType { get; set; }
        public string accessToken { get; set; }
        public int expiresIn { get; set; }
        public string refreshToken { get; set; }
    }

    public class SignupRequest : LoginRequest
    {
        public string Name { get; set; }
    }

    public class ApplicationUser
    {

        public string Email { get; set; }
        public string Password { get; set; }
    }
}