using AutoMapper;
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
        private readonly IMapper _mapper;

        public MessageService(IUnitOfWork unitOfWork,
        IFirebaseFunction firebaseFunction,
        INotificationService notificationService,
        IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _firebaseFunction = firebaseFunction;
            _notificationService = notificationService;
            _mapper = mapper;
        }

        public async Task SaveAndNotifyMessage(Message model)
        {
            _unitOfWork.Message.Add(model);
            var entity = _unitOfWork.Conversation.GetById(model.ConversationId);
            _unitOfWork.Conversation.Update(entity);
            // When a message sent, all members of that group will be having that group conversation back
            var participants = _unitOfWork.Participant.GetByConversationId(model.ConversationId);
            foreach (var participant in participants.Where(q => q.IsDeleted))
            {
                participant.IsDeleted = false;
                _unitOfWork.Participant.Update(participant);
            }
            _unitOfWork.Save();

            var notify = _mapper.Map<Message, MessageToNotify>(model);
            foreach (var contact in _unitOfWork.Participant.GetContactIdByConversationId(model.ConversationId))
            {
                var connection = _notificationService.GetConnection(contact);
                if (string.IsNullOrEmpty(connection)) continue;
                var notification = new FirebaseNotification
                {
                    to = connection,
                    data = new CustomNotification(NotificationEvent.NewMessage, notify)
                };
                await _firebaseFunction.Notify(notification);
            }
        }
    }
}