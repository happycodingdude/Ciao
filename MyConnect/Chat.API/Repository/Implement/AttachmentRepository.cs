namespace MyConnect.Repository
{
    public class AttachmentRepository : BaseRepository<Attachment>, IAttachmentRepository
    {
        public AttachmentRepository(CoreContext context) : base(context) { }
    }
}