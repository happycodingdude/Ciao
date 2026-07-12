namespace Presentation.Members;

/// <summary>
/// Rời/ẩn hội thoại — hai semantics theo loại (Phase 5 — Đợt 2b):
///  - Chat 1-1: giữ nguyên hành vi cũ — "ẩn hội thoại" (IsDeleted), có tin mới sẽ tự mở lại.
///  - NHÓM: rời nhóm THẬT — không tự mở lại khi có tin mới; kèm dòng hệ thống
///    "{user} left the group" + fanout MemberLeft cho member còn lại (cập nhật danh sách)
///    và chính người rời (thiết bị khác ẩn hội thoại). Quay lại chỉ qua được-thêm-lại/link mời.
/// Guard: quản trị viên DUY NHẤT không được rời khi nhóm còn thành viên active khác
/// (chưa có UI trao quyền — thuộc tính năng Phân quyền quản trị, đã dời).
/// Idempotent: đã rời rồi → no-op; 2 thiết bị bấm đồng thời → update Mongo có điều kiện
/// ElemMatch !IsDeleted nên chỉ 1 lần ăn (system message không bị đúp ở source of truth;
/// race window cache/FCM đúp chấp nhận được — Mongo tự đúng khi re-login).
/// </summary>
public static class DeleteMember
{
    public record Request(string conversationId) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        readonly IContactRepository _contactRepository;
        readonly IConversationRepository _conversationRepository;

        public Validator(IContactRepository contactRepository, IConversationRepository conversationRepository)
        {
            _contactRepository = contactRepository;
            _conversationRepository = conversationRepository;
            RuleFor(c => c.conversationId).ContactRelatedToConversation(_contactRepository, _conversationRepository);
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        readonly IValidator<Request> _validator;
        readonly IConversationRepository _conversationRepository;
        readonly IContactRepository _contactRepository;
        readonly MemberCache _memberCache;
        readonly MessageCache _messageCache;
        readonly IMapper _mapper;
        readonly IFirebaseFunction _firebase;

        public Handler(IValidator<Request> validator, IConversationRepository conversationRepository,
            IContactRepository contactRepository, MemberCache memberCache, MessageCache messageCache,
            IMapper mapper, IFirebaseFunction firebase)
        {
            _validator = validator;
            _conversationRepository = conversationRepository;
            _contactRepository = contactRepository;
            _memberCache = memberCache;
            _messageCache = messageCache;
            _mapper = mapper;
            _firebase = firebase;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var filter = MongoQuery<Conversation>.IdFilter(request.conversationId);
            var conversation = await _conversationRepository.GetItemAsync(filter);
            var userId = _contactRepository.GetUserId();
            var thisUser = conversation.Members.SingleOrDefault(q => q.ContactId == userId);
            if (thisUser is null || thisUser.IsDeleted) return Unit.Value;

            if (!conversation.IsGroup)
            {
                // Chat 1-1: hành vi cũ — chỉ ẩn hội thoại phía mình, không system message/fanout.
                thisUser.IsDeleted = true;
                var updates = Builders<Conversation>.Update.Set(q => q.Members, conversation.Members);
                _conversationRepository.UpdateNoTrackingTime(filter, updates);
                await _memberCache.MemberDelete(conversation.Id, userId);
                return Unit.Value;
            }

            // ===== Nhóm: rời nhóm thật =====
            var otherActiveMembers = conversation.Members
                .Where(m => m.ContactId != userId && !m.IsDeleted).ToList();

            // Guard: không để nhóm còn người mà mất toàn bộ quản trị.
            if (thisUser.IsModerator
                && otherActiveMembers.Any()
                && !otherActiveMembers.Any(m => m.IsModerator))
                throw new BadRequestException("You are the only admin. The group must have another admin before you can leave");

            var user = await _contactRepository.GetInfoAsync(userId);
            var systemMessage = new SystemMessage(AppConstants.SystemMessage_LeftGroup.Replace("{user}", user?.Name));
            var messageToAdd = _mapper.Map<Message>(systemMessage);

            // Atomic + idempotent: chỉ match khi member CÒN active — 2 thiết bị bấm đồng thời
            // thì request sau không match → không set trùng, không đúp system message ở Mongo.
            // NoTrackingTime: rời nhóm không đẩy hội thoại lên đầu danh sách người khác.
            var leaveFilter = Builders<Conversation>.Filter.And(
                filter,
                Builders<Conversation>.Filter.ElemMatch(c => c.Members,
                    m => m.ContactId == userId && !m.IsDeleted));
            var leaveUpdates = Builders<Conversation>.Update
                .Set("Members.$.IsDeleted", true)
                .Push(c => c.Messages, messageToAdd);
            _conversationRepository.UpdateNoTrackingTime(leaveFilter, leaveUpdates);

            // Redis: member cache đánh dấu đã rời + message cache có ngay dòng hệ thống
            // (member online mở lại chat thấy liền, không đợi re-login).
            await _memberCache.MemberDelete(conversation.Id, userId);
            await _messageCache.AddSystemMessage(conversation.Id, _mapper.Map<MessageWithReactions>(messageToAdd));

            // Realtime — fire-and-forget: member còn lại cập nhật danh sách + system message;
            // chính người rời nhận để thiết bị khác ẩn hội thoại. Fail → tự đúng ở lần fetch sau.
            var recipients = otherActiveMembers.Select(m => m.ContactId).Append(userId).ToArray();
            _ = _firebase.Notify(ChatEventNames.MemberLeft, recipients, new
            {
                ConversationId = conversation.Id,
                ContactId = userId,
                ContactName = user?.Name,
                SystemMessage = new EventSystemMessage
                {
                    Id = messageToAdd.Id,
                    Type = messageToAdd.Type,
                    Content = messageToAdd.Content,
                    ContactId = messageToAdd.ContactId,
                    CreatedTime = messageToAdd.CreatedTime
                }
            });

            return Unit.Value;
        }
    }
}

public class DeleteMemberEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapDelete("/{conversationId}/members",
        async (ISender sender, string conversationId) =>
        {
            var query = new DeleteMember.Request(conversationId);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization();
    }
}
