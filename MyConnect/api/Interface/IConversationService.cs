using MyConnect.Model;

namespace MyConnect.Interface
{
    public interface IConversationService
    {
        Task<Conversation> CreateGroupChatAndNotify(Conversation model);
    }
}