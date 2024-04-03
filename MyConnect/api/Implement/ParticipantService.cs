using MyConnect.Interface;
using MyConnect.Model;
using MyConnect.RestApi;
using AutoMapper;
using MyConnect.UOW;
using Microsoft.AspNetCore.JsonPatch;
using MyConnect.Authentication;

namespace MyConnect.Implement
{
    public class ParticipantService : IParticipantService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IFirebaseFunction _firebaseFunction;
        private readonly INotificationService _notificationService;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ParticipantService(IUnitOfWork unitOfWork,
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

        public async Task<IEnumerable<Participant>> AddAsync(Guid conversationId, List<Participant> model, bool includeNotify)
        {
            var participantToDelete = _unitOfWork.Participant.GetByConversationId(conversationId).Where(q => model.Any(w => w.ContactId == q.ContactId));
            foreach (var participant in participantToDelete)
                _unitOfWork.Participant.Delete(participant.Id);
            _unitOfWork.Participant.AddRange(model);
            _unitOfWork.Save();

            if (includeNotify)
            {
                var token = _httpContextAccessor.HttpContext.Session.GetString("Token");
                var contactId = JwtToken.ExtractToken(token);
                foreach (var contact in _unitOfWork.Participant.GetContactIdByConversationId(conversationId).Where(q => q != contactId.ToString()))
                {
                    var connection = _notificationService.GetConnection(contact);
                    var notification = new FirebaseNotification
                    {
                        to = connection,
                        data = new CustomNotification<IdModel>(NotificationEvent.AddMember, new IdModel { Id = conversationId })
                    };
                    await _firebaseFunction.Notify(notification);
                }
            }
            var result = _unitOfWork.Participant.GetByConversationIdIncludeContact(conversationId).Where(q => model.Any(w => w.ContactId == q.ContactId));
            return result;
        }

        public async Task<Participant> EditAsync(Guid id, JsonPatchDocument patch, bool includeNotify)
        {
            var entity = _unitOfWork.Participant.GetById(id);
            patch.ApplyTo(entity);
            _unitOfWork.Participant.Update(entity);

            var conversation = _unitOfWork.Conversation.GetById(entity.ConversationId);
            // conversation.UpdatedTime = DateTime.Now;
            // _unitOfWork.Conversation.Update(conversation);
            _unitOfWork.Save();

            if (includeNotify)
            {
                var token = _httpContextAccessor.HttpContext.Session.GetString("Token");
                var contactId = JwtToken.ExtractToken(token);
                var notify = _mapper.Map<Conversation, ConversationToNotify>(conversation);
                foreach (var contact in _unitOfWork.Participant.GetContactIdByConversationId(entity.ConversationId).Where(q => q != contactId.ToString()))
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
            return entity;
        }

        public bool CheckExistConversation(Guid id, Guid fid)
        {
            var result = _unitOfWork.Participant.GetAll()
            .GroupBy(q => q.ConversationId)
            .Any(q => q.Any(w => w.ContactId == id) && q.Any(w => w.ContactId == fid));
            return result;
        }
    }
}