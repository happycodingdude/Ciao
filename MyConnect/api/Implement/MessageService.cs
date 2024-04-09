using AutoMapper;
using Microsoft.EntityFrameworkCore;
using MyConnect.Authentication;
using MyConnect.Interface;
using MyConnect.Model;
using MyConnect.Repository;
using MyConnect.RestApi;
using MyConnect.UOW;
using MyConnect.Util;

namespace MyConnect.Implement
{
    public class MessageService : BaseService<Message, MessageDto>, IMessageService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly INotificationService _notificationService;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public MessageService(IMessageRepository repo,
        IUnitOfWork unitOfWork,
        INotificationService notificationService,
        IMapper mapper,
        IHttpContextAccessor httpContextAccessor) : base(repo, unitOfWork, mapper)
        {
            _unitOfWork = unitOfWork;
            _notificationService = notificationService;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<MessageDto> SaveAndNotifyMessage(MessageDto model)
        {
            var entity = _mapper.Map<MessageDto, Message>(model);
            _unitOfWork.Message.Add(entity);

            var conversation = _unitOfWork.Conversation.GetById(model.ConversationId);
            _unitOfWork.Conversation.Update(conversation);
            // When a message sent, all members of that group will be having that group conversation back
            var participants = _unitOfWork.Participant.DbSet.Where(q => q.ConversationId == model.ConversationId).ToList();
            foreach (var participant in participants.Where(q => q.IsDeleted))
            {
                participant.IsDeleted = false;
                _unitOfWork.Participant.Update(participant);
            }
            _unitOfWork.Save();

            var token = _httpContextAccessor.HttpContext.Session.GetString("Token");
            var contactId = JwtToken.ExtractToken(token);
            var notify = _mapper.Map<MessageDto, MessageToNotify>(model);
            foreach (var contact in participants.Select(q => q.ContactId.ToString()))
            {
                var connection = _notificationService.GetConnection(contact);
                var notification = new FirebaseNotification
                {
                    to = connection,
                    data = new CustomNotification<MessageToNotify>(NotificationEvent.NewMessage, notify)
                };
                await _notificationService.Notify<MessageToNotify>(NotificationEvent.NewMessage, connection, notify);
            }

            return model;
        }

        public IEnumerable<MessageNoReference> GetByConversationIdWithPaging(Guid id, int page, int limit)
        {
            var messages = _unitOfWork.Message.DbSet
            .Include(q => q.Attachments)
            .Where(q => q.ConversationId == id)
            .OrderByDescending(q => q.CreatedTime)
            .Skip(limit * (page - 1))
            .Take(limit)
            .ToList();

            SeenAll(id);

            return _mapper.Map<List<Message>, List<MessageNoReference>>(messages);
        }

        private void SeenAll(Guid id)
        {
            var token = _httpContextAccessor.HttpContext.Session.GetString("Token");
            var contactId = JwtToken.ExtractToken(token);

            var unseenMessages = _unitOfWork.Message.DbSet.Where(q => q.ConversationId == id && q.ContactId != contactId && q.Status == "received");
            foreach (var message in unseenMessages)
            {
                message.Status = "seen";
                message.SeenTime = DateTime.Now;
                _unitOfWork.Message.Update(message);
            }
            _unitOfWork.Save();
        }
    }
}