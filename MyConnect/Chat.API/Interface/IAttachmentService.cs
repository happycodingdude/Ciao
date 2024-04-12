using Chat.API.Model;
using Chat.API.Repository;

namespace Chat.API.Interface
{
    public interface IAttachmentService : IBaseService<Attachment, AttachmentDto>
    {
        IEnumerable<AttachmentGroupByCreatedTime> GetByConversationId(Guid id);
    }
}