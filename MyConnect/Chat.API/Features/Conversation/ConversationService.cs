namespace Chat.API.Features.Conversations;

public class ConversationService : BaseService<Conversation, ConversationDto>, IConversationService
{
    public ConversationService(IConversationRepository repo, IUnitOfWork unitOfWork, IMapper mapper)
        : base(repo, unitOfWork, mapper)
    {
    }
}