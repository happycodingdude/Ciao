namespace Domain.Features;

public class Friend : BaseModel
{
    public Guid FromContactId { get; set; }
    public Guid ToContactId { get; set; }
    public DateTime? AcceptTime { get; set; }
    public Contact? FromContact { get; set; }
    public Contact? ToContact { get; set; }
}