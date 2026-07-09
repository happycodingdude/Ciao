namespace Presentation.Conversations;

/// <summary>
/// Ghim / bỏ ghim hội thoại (per-user). Lưu PinnedTime trên Member sub-doc của chính user
/// → không ảnh hưởng thành viên khác, không cần fanout realtime (chỉ là preference cá nhân).
/// </summary>
public static class PinConversation
{
    public record Request(string conversationId, bool pinned) : IRequest<Unit>;

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
        readonly IContactRepository _contactRepository;
        readonly IConversationRepository _conversationRepository;
        readonly MemberCache _memberCache;

        public Handler(IValidator<Request> validator, IContactRepository contactRepository, IConversationRepository conversationRepository, MemberCache memberCache)
        {
            _validator = validator;
            _contactRepository = contactRepository;
            _conversationRepository = conversationRepository;
            _memberCache = memberCache;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var userId = _contactRepository.GetUserId();
            DateTime? pinnedTime = request.pinned ? DateTime.UtcNow : null;

            // Mongo (source of truth): set PinnedTime trên đúng Member của user.
            var filter = Builders<Conversation>.Filter.Eq(c => c.Id, request.conversationId);
            var updates = Builders<Conversation>.Update.Set("Members.$[elem].PinnedTime", pinnedTime);
            var arrayFilter = new BsonDocumentArrayFilterDefinition<Conversation>(
                new BsonDocument("elem.ContactId", userId));
            // NoTrackingTime: ghim không được đẩy hội thoại lên đầu danh sách (UpdatedTime giữ nguyên).
            _conversationRepository.UpdateNoTrackingTime(filter, updates, arrayFilter);

            // Redis member cache: patch để GetConversations trả PinnedTime mới mà không cần re-login.
            var members = await _memberCache.GetMembers(request.conversationId);
            if (members is not null)
            {
                var self = members.SingleOrDefault(q => q.Contact.Id == userId);
                if (self is not null)
                {
                    self.PinnedTime = pinnedTime;
                    await _memberCache.UpdateMembers(request.conversationId, members);
                }
            }

            return Unit.Value;
        }
    }
}

public class PinConversationEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapPut("{conversationId}/pin",
        async (ISender sender, string conversationId, bool pinned) =>
        {
            await sender.Send(new PinConversation.Request(conversationId, pinned));
            return Results.Ok();
        }).RequireAuthorization();
    }
}
