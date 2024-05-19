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