namespace Infrastructure.Repositories;

public class AttachmentRepository(MongoDbContext context, IHttpContextAccessor httpContextAccessor)
    : MongoBaseRepository<Attachment>(context, httpContextAccessor), IAttachmentRepository
{ }