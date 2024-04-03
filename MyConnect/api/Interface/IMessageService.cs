using MyConnect.Model;

namespace MyConnect.Interface
{
    public interface IMessageService
    {
        Task<Message> SaveAndNotifyMessage(Message model);
    }
}