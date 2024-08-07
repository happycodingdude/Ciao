namespace Infrastructure.Services;

// public class AttachmentService : BaseService<Attachment, AttachmentDto>, IAttachmentService
// {
//     private readonly IUnitOfWork _unitOfWork;

//     public AttachmentService(IAttachmentRepository repo,
//     IUnitOfWork unitOfWork,
//     IMapper mapper) : base(repo, unitOfWork, mapper)
//     {
//         _unitOfWork = unitOfWork;
//     }

//     public IEnumerable<AttachmentGroupByCreatedTime> GetByConversationId(Guid id)
//     {
//         var attachments = _unitOfWork.Attachment.DbSet
//         .Where(q => q.Message.ConversationId == id)
//         .OrderByDescending(q => q.CreatedTime)
//         .ToList();
//         var groupByCreatedTime = attachments
//         .GroupBy(q => q.CreatedTime.Value.Date)
//         .Select(q => new AttachmentGroupByCreatedTime
//         {
//             Date = q.Key.ToString("MM/dd/yyyy"),
//             Attachments = q.ToList()
//         });
//         return groupByCreatedTime;
//     }
// }