namespace Infrastructure.Repositories;

public class AttachmentRepository(MongoDbContext context, IUnitOfWork uow) : MongoBaseRepository<Attachment>(context, uow), IAttachmentRepository { }