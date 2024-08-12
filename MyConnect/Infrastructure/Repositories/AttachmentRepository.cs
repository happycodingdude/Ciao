namespace Infrastructure.Repositories;

public class AttachmentRepository(AppDbContext context) : BaseRepository<Attachment>(context), IAttachmentRepository { }