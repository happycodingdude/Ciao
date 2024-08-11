namespace Infrastructure.Services;

public class AttachmentService : BaseService<Attachment, AttachmentDto>, IAttachmentService
{
    public AttachmentService(IAttachmentRepository repo, IUnitOfWork unitOfWork, IMapper mapper) : base(repo, unitOfWork, mapper)
    {
    }
}