using Microsoft.AspNetCore.JsonPatch;
using MyConnect.Model;

namespace MyConnect.Interface
{
    public interface IParticipantService
    {
        Task<IEnumerable<Participant>> AddParticipantAndNotify(Guid id, List<Participant> model);
        Task<Participant> EditParticipantAndNotify(Guid id, JsonPatchDocument patch, bool includeNotify);
        Participant RemoveChat(Participant model);
        bool CheckExistConversation(Guid id, Guid fid);
    }
}