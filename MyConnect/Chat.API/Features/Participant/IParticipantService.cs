namespace Chat.API.Features.Participants;

public interface IParticipantService : IBaseService<Participant, ParticipantDto>
{
    Task AddAsync(Guid conversationId, List<ParticipantDto> model, bool includeNotify = false);
    // Task EditAsync(Guid id, JsonPatchDocument patch, bool includeNotify = false);
    bool CheckExistConversation(Guid id, Guid fid);
    //IEnumerable<ParticipantNoReference> GetByConversationIdIncludeContact(Guid id);
}