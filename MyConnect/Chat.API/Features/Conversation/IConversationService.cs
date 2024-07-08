namespace Chat.API.Features;

public interface IConversationService : IBaseService<Conversation, ConversationDto>
{
    // IEnumerable<ConversationWithTotalUnseen> GetAllWithUnseenMesages(int page, int limit);
    Task<ConversationDto> CreateAsync(ConversationDto model, bool includeNotify);
}