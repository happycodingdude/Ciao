using Microsoft.AspNetCore.JsonPatch;
using Chat.API.Model;
using Chat.API.Repository;

namespace Chat.API.Interface
{
    public interface IParticipantService : IBaseService<Participant, ParticipantDto>
    {
        Task<IEnumerable<ParticipantDto>> AddAsync(Guid conversationId, List<ParticipantDto> model, bool includeNotify);
        Task<ParticipantDto> EditAsync(Guid id, JsonPatchDocument patch, bool includeNotify);
        bool CheckExistConversation(Guid id, Guid fid);
        IEnumerable<ParticipantDto> GetByConversationIdIncludeContact(Guid id);
    }
}