using MyConnect.Model;

namespace MyConnect.Repository
{
    public interface IAttachmentRepository : IRepository<Attachment>
    {
        IEnumerable<AttachmentGroupByCreatedTime> GetByConversationId(Guid id);
    }
}