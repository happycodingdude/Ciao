namespace MyDockerWebAPI.Model
{
    public class Location : BaseModel
    {
        public string? Name { get; set; }
        public string? Address { get; set; }
        public ICollection<Submission>? Submissions { get; set; }
    }
}