namespace Domain.Features;

public class Notification : MongoBaseModel
{
    public string Content { get; set; }
    public bool Read { get; set; }
    public string ContactId { get; set; }
    public string SourceId { get; set; }
    public string SourceType { get; set; }
}