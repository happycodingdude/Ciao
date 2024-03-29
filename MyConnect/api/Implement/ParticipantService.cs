using MyConnect.Interface;
using MyConnect.Model;
using MyConnect.RestApi;
using AutoMapper;
using MyConnect.UOW;
using Microsoft.AspNetCore.JsonPatch;

namespace MyConnect.Implement
{
    public class ParticipantService : IParticipantService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IFirebaseFunction _firebaseFunction;
        private readonly INotificationService _notificationService;
        private readonly IMapper _mapper;

        public ParticipantService(IUnitOfWork unitOfWork,
        IFirebaseFunction firebaseFunction,
        INotificationService notificationService,
        IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _firebaseFunction = firebaseFunction;
            _notificationService = notificationService;
            _mapper = mapper;
        }

        public async Task<IEnumerable<Participant>> AddParticipantAndNotify(Guid id, List<Participant> model)
        {
            var participantToDelete = _unitOfWork.Participant.GetByConversationId(id).Where(q => model.Any(w => w.ContactId == q.ContactId));
            foreach (var participant in participantToDelete)
                _unitOfWork.Participant.Delete(participant.Id);
            _unitOfWork.Participant.AddRange(model);
            _unitOfWork.Save();
            foreach (var contact in _unitOfWork.Participant.GetContactIdByConversationId(id))
            {
                var connection = _notificationService.GetConnection(contact);
                var notification = new FirebaseNotification
                {
                    to = connection,
                    data = new CustomNotification<IdModel>(NotificationEvent.AddMember, new IdModel { Id = id })
                };
                await _firebaseFunction.Notify(notification);
            }
            var result = _unitOfWork.Participant.GetByConversationIdIncludeContact(id).Where(q => model.Any(w => w.ContactId == q.ContactId));
            return result;
        }

        public async Task<Participant> EditParticipantAndNotify(Guid id, JsonPatchDocument patch)
        {
            var entity = _unitOfWork.Participant.GetById(id);
            patch.ApplyTo(entity);
            _unitOfWork.Participant.Update(entity);

            var conversation = _unitOfWork.Conversation.GetById(entity.ConversationId);
            conversation.UpdatedTime = DateTime.Now;
            _unitOfWork.Conversation.Update(conversation);
            _unitOfWork.Save();

            var notify = _mapper.Map<Conversation, ConversationToNotify>(conversation);
            foreach (var contact in _unitOfWork.Participant.GetContactIdByConversationId(entity.ConversationId))
            {
                var connection = _notificationService.GetConnection(contact);
                var notification = new FirebaseNotification
                {
                    to = connection,
                    data = new CustomNotification<ConversationToNotify>(NotificationEvent.NewConversation, notify)
                };
                await _firebaseFunction.Notify(notification);
            }
            return entity;
        }

        public Participant RemoveChat(Participant model)
        {
            _unitOfWork.Participant.Update(model);
            _unitOfWork.Save();
            return model;
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