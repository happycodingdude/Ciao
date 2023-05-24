namespace MyDockerWebAPI.Model
{
    public class User : BaseModel
    {
        public string? Name { get; set; }
        public string? Username { get; set; }
        public string? Password { get; set; }
        public int? RetryTime { get; set; }
    }
}