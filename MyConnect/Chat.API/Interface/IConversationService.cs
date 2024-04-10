using MyConnect.Model;
using MyConnect.Repository;

namespace MyConnect.Interface
{
    public interface IConversationService : IBaseService<Conversation, ConversationDto>
    {
        IEnumerable<ConversationWithTotalUnseen> GetAllWithUnseenMesages(int page, int limit);
        Task<ConversationDto> CreateAsync(ConversationDto model, bool includeNotify);
    }
}