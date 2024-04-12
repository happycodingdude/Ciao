namespace Chat.API.Model
{
    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class SignupRequest : LoginRequest
    {
        public string Name { get; set; }
    }
}