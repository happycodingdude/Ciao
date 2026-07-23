namespace Presentation.Conversations;

/// <summary>
/// messageId + người ghim của các tin đã ghim TRONG một hội thoại — FE dùng để hiển thị badge
/// "đã ghim" + tooltip trên từng tin mà không cần tải toàn bộ danh sách. Đối xứng bookmark ids
/// (nguồn trạng thái ghim inline sau khi tách pin khỏi message sub-doc).
/// </summary>
public static class GetConversationPinnedIds
{
    public record Request(string conversationId) : IRequest<List<PinnedIdItem>>;

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

    internal sealed class Handler : IRequestHandler<Request, List<PinnedIdItem>>
    {
        readonly IValidator<Request> _validator;
        readonly IPinRepository _pinRepository;

        public Handler(IValidator<Request> validator, IPinRepository pinRepository)
        {
            _validator = validator;
            _pinRepository = pinRepository;
        }

        public async Task<List<PinnedIdItem>> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var filter = Builders<Pin>.Filter.Eq(q => q.ConversationId, request.conversationId);
            var pins = await _pinRepository.GetAllAsync(filter);
            return pins.Select(q => new PinnedIdItem { MessageId = q.MessageId, PinnedBy = q.PinnedBy }).ToList();
        }
    }
}

public class GetConversationPinnedIdsEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        // GET /api/v1/conversations/{conversationId}/pins/ids
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapGet("{conversationId}/pins/ids",
        async (ISender sender, string conversationId) =>
        {
            var result = await sender.Send(new GetConversationPinnedIds.Request(conversationId));
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}
