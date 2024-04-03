using AutoMapper;
using MyConnect.Authentication;
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
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ConversationService(IUnitOfWork unitOfWork,
        IFirebaseFunction firebaseFunction,
        INotificationService notificationService,
        IMapper mapper,
        IHttpContextAccessor httpContextAccessor)
        {
            _unitOfWork = unitOfWork;
            _firebaseFunction = firebaseFunction;
            _notificationService = notificationService;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Conversation> CreateAsync(Conversation model, bool includeNotify)
        {
            _unitOfWork.Conversation.Add(model);
            _unitOfWork.Save();

            if (includeNotify)
            {
                var token = _httpContextAccessor.HttpContext.Session.GetString("Token");
                var contactId = JwtToken.ExtractToken(token);
                var notify = _mapper.Map<Conversation, ConversationToNotify>(model);
                foreach (var contact in model.Participants.Where(q => q.ContactId != contactId).Select(q => q.ContactId.ToString()))
                {
                    var connection = _notificationService.GetConnection(contact);
                    var notification = new FirebaseNotification
                    {
                        to = connection,
                        data = new CustomNotification<ConversationToNotify>(NotificationEvent.NewConversation, notify)
                    };
                    await _firebaseFunction.Notify(notification);
                }
            }
            return model;
        }
    }
}