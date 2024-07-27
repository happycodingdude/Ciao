namespace Chat.API.Features.Messages;

public class MessageService : BaseService<Message, MessageDto>, IMessageService
{
    public MessageService(IMessageRepository repo, IUnitOfWork unitOfWork, IMapper mapper)
        : base(repo, unitOfWork, mapper)
    {
    }
}