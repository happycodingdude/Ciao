namespace Chat.API.Interface;

public interface IParticipantService : IBaseService<Participant, ParticipantDto>
{
    Task<IEnumerable<ParticipantDto>> AddAsync(Guid conversationId, List<ParticipantDto> model, bool includeNotify);
    Task<ParticipantDto> EditAsync(Guid id, JsonPatchDocument patch, bool includeNotify);
    bool CheckExistConversation(Guid id, Guid fid);
    IEnumerable<ParticipantNoReference> GetByConversationIdIncludeContact(Guid id);
}