namespace Domain.Features;

public interface IParticipantRepository : IRepository<Participant>
{
    IEnumerable<Participant> GetByConversationId(Guid conversationId);
}