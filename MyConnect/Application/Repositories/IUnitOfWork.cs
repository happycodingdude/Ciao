namespace Application.Repositories;

public interface IUnitOfWork : IDisposable
{
    // IContactRepository Contact { get; }
    // IConversationRepository Conversation { get; }
    // IMessageRepository Message { get; }
    // IParticipantRepository Participant { get; }
    // IScheduleRepository Schedule { get; }
    // IScheduleContactRepository ScheduleContact { get; }
    // IAttachmentRepository Attachment { get; }
    // IFriendRepository Friend { get; }
    // INotificationRepository Notification { get; }
    Task SaveAsync();
    void AddOperation(Action operation);
    void CleanOperations();
    // IDisposable Session { get; }
}