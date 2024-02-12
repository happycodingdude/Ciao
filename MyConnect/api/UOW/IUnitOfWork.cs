using MyConnect.Repository;

namespace MyConnect.UOW
{
    public interface IUnitOfWork
    {
        IContactRepository Contact { get; }
        IConversationRepository Conversation { get; }
        IMessageRepository Message { get; }
        IParticipantRepository Participant { get; }
        IScheduleRepository Schedule { get; }
        IScheduleContactRepository ScheduleContact { get; }
        IAttachmentRepository Attachment { get; }
        IFriendRepository Friend { get; }
        void Save();
    }
}