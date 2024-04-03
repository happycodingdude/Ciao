using Microsoft.AspNetCore.JsonPatch;
using MyConnect.Model;

namespace MyConnect.Interface
{
    public interface IParticipantService
    {
        Task<IEnumerable<Participant>> AddAsync(Guid conversationId, List<Participant> model, bool includeNotify);
        Task<Participant> EditAsync(Guid id, JsonPatchDocument patch, bool includeNotify);
        bool CheckExistConversation(Guid id, Guid fid);
    }
}