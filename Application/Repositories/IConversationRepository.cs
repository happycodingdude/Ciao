namespace Application.Repositories;

public interface IConversationRepository : IMongoRepository<Conversation>
{
    Task<IEnumerable<ConversationWithTotalUnseenWithContactInfo>> GetConversationsWithUnseenMesages(PagingParam pagingParam);
    // Task<object> GetById(string id, PagingParam pagingParam);
}