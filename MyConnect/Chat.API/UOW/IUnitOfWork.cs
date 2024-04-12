using Chat.API.Repository;

namespace Chat.API.UOW
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
        INotificationRepository Notification { get; }
        void Save();
    }
}