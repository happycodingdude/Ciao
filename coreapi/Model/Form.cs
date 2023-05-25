namespace MyDockerWebAPI.Model
{
    public class Form : BaseModel
    {
        public string? Name { get; set; }
        public int? Budget { get; set; }
        public ICollection<Submission>? Submissions { get; set; }
    }
}