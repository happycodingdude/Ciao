using Microsoft.AspNetCore.JsonPatch;
using MyConnect.Model;
using MyConnect.Repository;

namespace MyConnect.Interface
{
    public interface IParticipantService : IBaseService<Participant, ParticipantDto>
    {
        Task<IEnumerable<ParticipantDto>> AddAsync(Guid conversationId, List<ParticipantDto> model, bool includeNotify);
        Task<ParticipantDto> EditAsync(Guid id, JsonPatchDocument patch, bool includeNotify);
        bool CheckExistConversation(Guid id, Guid fid);
        IEnumerable<ParticipantDto> GetByConversationIdIncludeContact(Guid id);
    }
}