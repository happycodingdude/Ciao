namespace Application.Repositories;

public interface IConversationRepository : IMongoRepository<Conversation>
{
    Task<IEnumerable<ConversationWithTotalUnseenWithContactInfo>> GetConversationsWithUnseenMesages(string userId, PagingParam pagingParam);
    Task<List<MessageSearchResult>> SearchMessages(string conversationId, string keyword, PagingParam pagingParam);
    // Task<object> GetById(string id, PagingParam pagingParam);
}