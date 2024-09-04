namespace Infrastructure.Repositories;

// public class AttachmentRepository(AppDbContext context) : BaseRepository<Attachment>(context), IAttachmentRepository { }
public class AttachmentRepository : MongoBaseRepository<Attachment>, IAttachmentRepository
{
    public AttachmentRepository(MongoDbContext context, string dbName) : base(context, dbName) { }
}