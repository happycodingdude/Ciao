using MyConnect.Model;
using MyConnect.Repository;

namespace MyConnect.Interface
{
    public interface IAttachmentService : IBaseService<Attachment, AttachmentDto>
    {
        IEnumerable<AttachmentGroupByCreatedTime> GetByConversationId(Guid id);
    }
}