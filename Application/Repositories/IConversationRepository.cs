namespace Application.Repositories;

public interface IConversationRepository : IMongoRepository<Conversation>
{
    Task<IEnumerable<ConversationWithTotalUnseenWithContactInfo>> GetConversationsWithUnseenMesages(string userId, PagingParam pagingParam);
    Task<List<MessageSearchResult>> SearchMessages(string conversationId, string keyword, PagingParam pagingParam, CancellationToken cancellationToken = default);
    Task<List<Message>> GetPinnedMessages(string conversationId, string? keyword = null, CancellationToken cancellationToken = default);
    // Task<object> GetById(string id, PagingParam pagingParam);
}