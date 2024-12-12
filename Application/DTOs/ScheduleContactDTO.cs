namespace Application.DTOs;

public class ScheduleContactDto : MongoBaseModel
{
    public bool IsDeleted { get; set; }
    public string ScheduleId { get; set; } = null!;
    public string ContactId { get; set; } = null!;
    public Schedule Schedule { get; set; } = null!;
    public Contact Contact { get; set; } = null!;
}