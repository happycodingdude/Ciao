namespace Domain.Entities;

public class Notification : MongoBaseModel
{
    public string Content { get; set; } = null!;
    public bool Read { get; set; }
    public string ContactId { get; set; } = null!;
    public string SourceId { get; set; } = null!;
    public string SourceType { get; set; } = null!;
}