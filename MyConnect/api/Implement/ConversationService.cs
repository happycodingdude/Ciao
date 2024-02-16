using AutoMapper;
using MyConnect.Interface;
using MyConnect.Model;
using MyConnect.RestApi;
using MyConnect.UOW;

namespace MyConnect.Implement
{
    public class ConversationService : IConversationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IFirebaseFunction _firebaseFunction;
        private readonly INotificationService _notificationService;
        private readonly IMapper _mapper;

        public ConversationService(IUnitOfWork unitOfWork,
        IFirebaseFunction firebaseFunction,
        INotificationService notificationService,
        IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _firebaseFunction = firebaseFunction;
            _notificationService = notificationService;
            _mapper = mapper;
        }

        public async Task<Conversation> CreateConversationAndNotify(Conversation model)
        {
            _unitOfWork.Conversation.Add(model);
            _unitOfWork.Save();

            var notify = _mapper.Map<Conversation, ConversationToNotify>(model);
            foreach (var contact in _unitOfWork.Participant.GetContactIdByConversationId(model.Id))
            {
                var connection = _notificationService.GetConnection(contact);
                var notification = new FirebaseNotification
                {
                    to = connection,
                    data = new Notification(NotificationEvent.NewConversation, notify)
                };
                await _firebaseFunction.Notify(notification);
            }
            return model;
        }
    }
}