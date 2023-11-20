using MyConnect.Model;

namespace MyConnect.Interface
{
    public interface IMessageService
    {
        Task SaveAndNotifyMessage(Message model);
    }
}