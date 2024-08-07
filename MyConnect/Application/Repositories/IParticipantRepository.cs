namespace Application.Repositories;

public interface IParticipantRepository : IRepository<Participant>
{
    IEnumerable<Participant> GetByConversationId(Guid conversationId);
}