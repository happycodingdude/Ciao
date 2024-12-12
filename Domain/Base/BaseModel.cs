namespace Domain.Base;

public class BaseModel
{
    public Guid Id { get; set; }
    public DateTime? CreatedTime { get; set; }
    public DateTime? UpdatedTime { get; set; }

    public void BeforeUpdate()
    {
        UpdatedTime = DateTime.Now;
    }
}