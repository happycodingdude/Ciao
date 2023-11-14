using MyConnect.Repository;

namespace MyConnect.UOW
{
    public interface IUnitOfWork
    {
        IContactRepository Contact { get; }
        IConversationRepository Conversation { get; }
        IMessageRepository Message { get; }
        IParticipantsRepository Participants { get; }
        IScheduleRepository Schedule { get; }
        IScheduleContactRepository ScheduleContact { get; }
        void Save();
    }
}