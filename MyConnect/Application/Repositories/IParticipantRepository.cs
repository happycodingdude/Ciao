namespace Application.Repositories;

public interface IParticipantRepository : IMongoRepository<Participant>
{
    // IEnumerable<Participant> GetByConversationId(Guid conversationId);
}