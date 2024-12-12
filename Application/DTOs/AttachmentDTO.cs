namespace Application.DTOs;

public class AttachmentDto : MongoBaseModel
{
    public string Type { get; set; } = null!;
    public string MediaName { get; set; } = null!;
    public double MediaSize { get; set; }
    public string MediaUrl { get; set; } = null!;
}

public class AttachmentGroupByCreatedTime
{
    public string Date { get; set; } = null!;
    public List<Attachment> Attachments { get; set; } = null!;
}