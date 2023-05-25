namespace MyDockerWebAPI.Model
{
    public class BaseModel
    {
        public int Id { get; set; }
        public DateTime? CreateTime { get; set; }
        public DateTime? ModifyTime { get; set; }

        public void BeforeAdd()
        {
        }

        public void BeforeUpdate(BaseModel current)
        {
            CreateTime = current.CreateTime;
            ModifyTime = DateTime.Now;
        }
    }
}