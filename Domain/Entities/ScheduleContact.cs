namespace Domain.Entities;

public class ScheduleContact : MongoBaseModel
{
    public bool IsDeleted { get; set; }
    public string ScheduleId { get; set; } = null!;
    public string ContactId { get; set; } = null!;
    public Schedule Schedule { get; set; } = null!;
    public Contact Contact { get; set; } = null!;
}