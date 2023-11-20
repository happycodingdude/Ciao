using MyConnect.Interface;
using MyConnect.Model;
using MyConnect.RestApi;
using MyConnect.UOW;

namespace MyConnect.Implement
{
    public class MessageService : IMessageService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IFirebaseFunction _firebaseFunction;
        private readonly INotificationService _notificationService;

        public MessageService(IUnitOfWork unitOfWork,
        IFirebaseFunction firebaseFunction,
        INotificationService notificationService)
        {
            _unitOfWork = unitOfWork;
            _firebaseFunction = firebaseFunction;
            _notificationService = notificationService;
        }

        public async Task SaveAndNotifyMessage(Message model)
        {
            _unitOfWork.Message.Add(model);
            _unitOfWork.Save();
            foreach (var connection in _notificationService.Connections)
            {
                var notification = new FirebaseNotification
                {
                    to = connection.Value,
                    data = model
                };
                await _firebaseFunction.Notify(notification);
            }
        }
    }
}