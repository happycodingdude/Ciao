namespace MyDockerWebAPI.Model
{
    public class Participant : BaseModel
    {
        public string? Name { get; set; }
        public ICollection<Submission>? Submissions { get; set; }
    }
}