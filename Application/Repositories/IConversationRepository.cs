namespace Application.Repositories;

public interface IConversationRepository : IMongoRepository<Conversation>
{
    Task<IEnumerable<ConversationWithTotalUnseen>> GetConversationsWithUnseenMesages(PagingParam pagingParam);
    Task<ConversationWithMessages> GetById(string id, PagingParam pagingParam);
}