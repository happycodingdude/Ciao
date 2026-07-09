namespace Presentation.Conversations;

/// <summary>
/// Cập nhật giao diện chat CỦA RIÊNG USER cho một hội thoại: hình nền (wallpaper)
/// và màu bong bóng (bubbleColor) — lưu key preset trên Member của chính user.
/// null/rỗng = về mặc định. Không fanout realtime (preference cá nhân).
/// </summary>
public static class UpdateConversationAppearance
{
    public record Request(string conversationId, string? wallpaper, string? bubbleColor) : IRequest<Unit>;

    public record Body(string? Wallpaper, string? BubbleColor);

    public class Validator : AbstractValidator<Request>
    {
        readonly IContactRepository _contactRepository;
        readonly IConversationRepository _conversationRepository;

        public Validator(IContactRepository contactRepository, IConversationRepository conversationRepository)
        {
            _contactRepository = contactRepository;
            _conversationRepository = conversationRepository;
            RuleFor(c => c.conversationId).ContactRelatedToConversation(_contactRepository, _conversationRepository);
            // Key preset ngắn — chặn payload rác.
            RuleFor(c => c.wallpaper).MaximumLength(50);
            RuleFor(c => c.bubbleColor).MaximumLength(50);
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
            var wallpaper = string.IsNullOrWhiteSpace(request.wallpaper) ? null : request.wallpaper;
            var bubbleColor = string.IsNullOrWhiteSpace(request.bubbleColor) ? null : request.bubbleColor;

            var filter = Builders<Conversation>.Filter.Eq(c => c.Id, request.conversationId);
            var updates = Builders<Conversation>.Update
                .Set("Members.$[elem].Wallpaper", wallpaper)
                .Set("Members.$[elem].BubbleColor", bubbleColor);
            var arrayFilter = new BsonDocumentArrayFilterDefinition<Conversation>(
                new BsonDocument("elem.ContactId", userId));
            _conversationRepository.UpdateNoTrackingTime(filter, updates, arrayFilter);

            // Patch member cache để reload/GetConversations trả giá trị mới ngay.
            var members = await _memberCache.GetMembers(request.conversationId);
            var self = members?.SingleOrDefault(q => q.Contact.Id == userId);
            if (self is not null)
            {
                self.Wallpaper = wallpaper;
                self.BubbleColor = bubbleColor;
                await _memberCache.UpdateMembers(request.conversationId, members!);
            }

            return Unit.Value;
        }
    }
}

public class UpdateConversationAppearanceEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapPut("{conversationId}/appearance",
        async (ISender sender, string conversationId, UpdateConversationAppearance.Body body) =>
        {
            await sender.Send(new UpdateConversationAppearance.Request(conversationId, body.Wallpaper, body.BubbleColor));
            return Results.Ok();
        }).RequireAuthorization();
    }
}
