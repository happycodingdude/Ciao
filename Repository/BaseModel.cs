namespace MyDockerWebAPI.Repository
{
    public class BaseModel
    {
        public int Id { get; set; }
        public DateTime? create_time { get; set; }
        public DateTime? modify_time { get; set; }
    }
}