namespace Application.DTOs;

public class ScheduleDto : BaseModel
{
    public string Content { get; set; } = null!;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Status { get; set; } = null!;
    public List<ScheduleContact> ScheduleContacts { get; set; } = new List<ScheduleContact>();
}