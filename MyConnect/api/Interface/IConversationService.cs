using MyConnect.Model;

namespace MyConnect.Interface
{
    public interface IConversationService
    {
        Task<Conversation> CreateConversationAndNotify(Conversation model);
    }
}