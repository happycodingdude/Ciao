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

        public async Task<Conversation> CreateGroupChatAndNotify(Conversation model)
        {
            _unitOfWork.Conversation.Add(model);
            _unitOfWork.Save();

            var notify = _mapper.Map<Conversation, ConversationToNotify>(model);
            foreach (var connection in _notificationService.Connections)
            {
                var notification = new FirebaseNotification
                {
                    to = connection.Value,
                    data = new Notification(NotificationEvent.NewConversation, notify)
                };
                await _firebaseFunction.Notify(notification);
            }
            return model;
        }
    }
}