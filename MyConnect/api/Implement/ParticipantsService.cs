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

        public async Task NotifyMessage(Guid id)
        {
            // var entity = _unitOfWork.Participants.GetByConversationIdIncludeContact(id);
            // foreach (var item in entity)
            // {

            // }


            foreach (var connection in _notificationService.Connections)
            {
                var notification = new FirebaseNotification
                {
                    to = connection,
                    data = new
                    {
                        ConversationId = "ConversationId",
                        Content = "Content"
                    }
                };
                await _firebaseFunction.Notify(notification);
            }
        }
    }
}