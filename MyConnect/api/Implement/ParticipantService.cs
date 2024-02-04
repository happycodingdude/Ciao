using MyConnect.Interface;
using MyConnect.Model;
using MyConnect.RestApi;
using MyConnect.UOW;

namespace MyConnect.Implement
{
    public class ParticipantService : IParticipantService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IFirebaseFunction _firebaseFunction;
        private readonly INotificationService _notificationService;

        public ParticipantService(IUnitOfWork unitOfWork,
        IFirebaseFunction firebaseFunction,
        INotificationService notificationService)
        {
            _unitOfWork = unitOfWork;
            _firebaseFunction = firebaseFunction;
            _notificationService = notificationService;
        }

        public async Task<IEnumerable<Participant>> AddParticipantAndNotify(List<Participant> model)
        {
            _unitOfWork.Participant.AddRange(model);
            _unitOfWork.Save();            
            foreach (var contact in _unitOfWork.Participant.GetContactIdByConversationId(model.FirstOrDefault().ConversationId))
            {
                var connection = _notificationService.GetConnection(contact);
                var notification = new FirebaseNotification
                {
                    to = connection,
                    data = new Notification(NotificationEvent.AddMember, model)
                };
                await _firebaseFunction.Notify(notification);
            }
            return model;
        }

        public async Task<Participant> RemoveChatAndNotify(Participant model)
        {
            _unitOfWork.Participant.Update(model);
            _unitOfWork.Save();
            foreach (var contact in _unitOfWork.Participant.GetContactIdByConversationId(model.ConversationId))
            {
                var connection = _notificationService.GetConnection(contact);
                var notification = new FirebaseNotification
                {
                    to = connection,
                    data = new Notification(NotificationEvent.RemoveChat, model)
                };
                await _firebaseFunction.Notify(notification);
            }
            return model;
        }
    }
}