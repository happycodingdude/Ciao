using MyConnect.Model;

namespace MyConnect.Interface
{
    public interface IConversationService
    {
        Task<Conversation> CreateAsync(Conversation model, bool includeNotify);
    }
}