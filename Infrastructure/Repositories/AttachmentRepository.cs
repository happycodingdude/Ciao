namespace Infrastructure.Repositories;

public class AttachmentRepository(MongoDbContext context, IUnitOfWork uow, IHttpContextAccessor httpContextAccessor)
    : MongoBaseRepository<Attachment>(context, uow, httpContextAccessor), IAttachmentRepository
// public class AttachmentRepository(MongoDbContext context, IHttpContextAccessor httpContextAccessor)
//     : MongoBaseRepository<Attachment>(context, httpContextAccessor), IAttachmentRepository
{ }