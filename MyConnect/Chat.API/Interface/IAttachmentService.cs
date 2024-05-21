namespace Chat.API.Interface;

public interface IAttachmentService : IBaseService<Attachment, AttachmentDto>
{
    IEnumerable<AttachmentGroupByCreatedTime> GetByConversationId(Guid id);
}