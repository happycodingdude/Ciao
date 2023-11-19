namespace MyConnect.Model
{
    public class Schedule : BaseModel
    {
        public string? Content { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? Status { get; set; }
        public ICollection<ScheduleContact>? ScheduleContacts { get; set; }
    }
}