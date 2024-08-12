namespace Infrastructure.Services;

public class ConversationService(IConversationRepository repo, IUnitOfWork unitOfWork, IMapper mapper)
    : BaseService<Conversation, ConversationDto>(repo, unitOfWork, mapper), IConversationService
{ }