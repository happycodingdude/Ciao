namespace Application.Repositories;

public interface IConversationRepository : IMongoRepository<Conversation>
{
    Task<GetConversationsWithUnseenMesagesResponse> GetConversationsWithUnseenMesages(PagingParam pagingParam);
    Task<ConversationWithMessages> GetById(string id, PagingParam pagingParam);
}