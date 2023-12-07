using MyConnect.Model;

namespace MyConnect.Repository
{
    public class AttachmentRepository : BaseRepository<Attachment>, IAttachmentRepository
    {
        public AttachmentRepository(CoreContext context) : base(context) { }

        public void Add(Model.Attachment entity)
        {
            throw new NotImplementedException();
        }

        public IEnumerable<AttachmentGroupByCreatedTime> GetByConversationId(Guid id)
        {
            var attachments = _dbSet
            .Where(q => q.Message.ConversationId == id)
            .OrderByDescending(q => q.CreatedTime)
            .ToList();
            var groupByCreatedTime = attachments
            .GroupBy(q => q.CreatedTime.Value.Date)
            .Select(q => new AttachmentGroupByCreatedTime
            {
                Date = q.Key.ToString("MM/dd/yyyy"),
                Attachments = q.ToList()
            });
            return groupByCreatedTime;
        }
    }
}