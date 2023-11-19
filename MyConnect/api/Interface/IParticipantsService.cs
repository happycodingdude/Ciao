namespace MyConnect.Interface
{
    public interface IParticipantsService
    {
        Task NotifyMessage(Guid id);
    }
}