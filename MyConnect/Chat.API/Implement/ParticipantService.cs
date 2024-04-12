using Chat.API.Interface;
using Chat.API.Model;
using Chat.API.RestApi;
using AutoMapper;
using Chat.API.UOW;
using Microsoft.AspNetCore.JsonPatch;
using Chat.API.Authentication;
using Chat.API.Repository;
using Microsoft.EntityFrameworkCore;
using Chat.API.Util;

namespace Chat.API.Implement
{
    public class ParticipantService : BaseService<Participant, ParticipantDto>, IParticipantService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly INotificationService _notificationService;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ParticipantService(IParticipantRepository repo,
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

        public async Task<IEnumerable<ParticipantDto>> AddAsync(Guid conversationId, List<ParticipantDto> model, bool includeNotify)
        {
            // Get all participants of conversation
            var allParticipants = _unitOfWork.Participant.DbSet.Where(q => q.ConversationId == conversationId).ToList();
            // Delete all participants about to add if exists
            _unitOfWork.Participant.Delete(allParticipants.Where(q => model.Any(w => w.ContactId == q.ContactId)).ToList());
            // Add new participants
            var participantToAdd = _mapper.Map<List<ParticipantDto>, List<Participant>>(model);
            _unitOfWork.Participant.Add(participantToAdd);
            _unitOfWork.Save();

            if (includeNotify)
            {
                var token = _httpContextAccessor.HttpContext.Session.GetString("Token");
                var contactId = JwtToken.ExtractToken(token);
                foreach (var contact in allParticipants.Select(q => q.ContactId.ToString()).Where(q => q != contactId.ToString()))
                {
                    var connection = _notificationService.GetConnection(contact);
                    await _notificationService.Notify<IdModel>(Constants.NotificationEvent_AddMember, connection, new IdModel { Id = conversationId });
                }
            }
            var result = _unitOfWork.Participant.DbSet.Include(q => q.Contact).Where(q => q.ConversationId == conversationId && model.Any(w => w.ContactId == q.ContactId)).ToList();
            return _mapper.Map<List<Participant>, List<ParticipantDto>>(result);
        }

        public async Task<ParticipantDto> EditAsync(Guid id, JsonPatchDocument patch, bool includeNotify)
        {
            var entity = Patch(id, patch);

            var conversation = _unitOfWork.Conversation.GetById(entity.ConversationId);
            // conversation.UpdatedTime = DateTime.Now;
            // _unitOfWork.Conversation.Update(conversation);
            _unitOfWork.Save();

            if (includeNotify)
            {
                var token = _httpContextAccessor.HttpContext.Session.GetString("Token");
                var contactId = JwtToken.ExtractToken(token);
                var notify = _mapper.Map<Conversation, ConversationToNotify>(conversation);
                foreach (var contact in _unitOfWork.Participant.DbSet.Where(q => q.ConversationId == entity.ConversationId && q.ContactId != contactId).Select(q => q.ContactId.ToString()))
                {
                    var connection = _notificationService.GetConnection(contact);
                    await _notificationService.Notify<ConversationToNotify>(Constants.NotificationEvent_AddMember, connection, notify);
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

        public IEnumerable<ParticipantDto> GetByConversationIdIncludeContact(Guid id)
        {
            var entity = _unitOfWork.Participant.DbSet
            .Include(q => q.Contact)
            .Where(q => q.ConversationId == id)
            .ToList();
            return _mapper.Map<List<Participant>, List<ParticipantDto>>(entity);
        }
    }
}