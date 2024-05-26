namespace Authentication.API;

class SignupRequest
{
    public string Name { get; set; }
    public string Username { get; set; }
    public string Password { get; set; }
}

class CreateContact
{
    public string Id { get; set; }
    public string Name { get; set; }
}

class SignInResponse
{
    public string tokenType { get; set; }
    public string accessToken { get; set; }
    public int expiresIn { get; set; }
    public string refreshToken { get; set; }
}