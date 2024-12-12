namespace Domain.Entities;

public class Schedule : MongoBaseModel
{
    public string Content { get; set; } = null!;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Status { get; set; } = null!;
    public ICollection<ScheduleContact> ScheduleContacts { get; set; } = new List<ScheduleContact>();
}