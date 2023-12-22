using MyConnect.Interface;
using MyConnect.Model;
using MyConnect.RestApi;
using MyConnect.UOW;

namespace MyConnect.Implement
{
    public class ParticipantsService : IParticipantsService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IFirebaseFunction _firebaseFunction;
        private readonly INotificationService _notificationService;

        public ParticipantsService(IUnitOfWork unitOfWork,
        IFirebaseFunction firebaseFunction,
        INotificationService notificationService)
        {
            _unitOfWork = unitOfWork;
            _firebaseFunction = firebaseFunction;
            _notificationService = notificationService;
        }

        public async Task<IEnumerable<Participants>> AddParticipantAndNotify(List<Participants> model)
        {
            _unitOfWork.Participants.AddRange(model);
            _unitOfWork.Save();
            foreach (var connection in _notificationService.Connections)
            {
                var notification = new FirebaseNotification
                {
                    to = connection.Value,
                    data = new Notification(NotificationEvent.AddMember, model)
                };
                await _firebaseFunction.Notify(notification);
            }
            return model;
        }

        public async Task<Participants> RemoveChatAndNotify(Participants model)
        {
            _unitOfWork.Participants.Update(model);
            _unitOfWork.Save();
            foreach (var connection in _notificationService.Connections)
            {
                var notification = new FirebaseNotification
                {
                    to = connection.Value,
                    data = new Notification(NotificationEvent.RemoveChat, model)
                };
                await _firebaseFunction.Notify(notification);
            }
            return model;
        }
    }
}