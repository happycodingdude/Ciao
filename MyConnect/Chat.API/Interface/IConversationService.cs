using Chat.API.Model;
using Chat.API.Repository;

namespace Chat.API.Interface
{
    public interface IConversationService : IBaseService<Conversation, ConversationDto>
    {
        IEnumerable<ConversationWithTotalUnseen> GetAllWithUnseenMesages(int page, int limit);
        Task<ConversationDto> CreateAsync(ConversationDto model, bool includeNotify);
    }
}