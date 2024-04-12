namespace Chat.API.Repository
{
    public class Notification : BaseModel
    {
        public Guid SourceId { get; set; }
        public string SourceType { get; set; }
        public string Content { get; set; }
        public bool Read { get; set; }
        public Guid ContactId { get; set; }
        public Contact? Contact { get; set; }
    }
}