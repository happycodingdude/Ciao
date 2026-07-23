namespace Presentation.Conversations;

/// <summary>
/// Danh sách liên kết đã gửi trong hội thoại (cho tab "Liên kết" của phần Media).
/// Gom từ LinkPreviews của các tin text còn hiệu lực (bỏ tin đã thu hồi), mới trước.
/// Trả TẤT CẢ link 1 lần — KHÔNG phân trang (đồng bộ cách Images/Videos/Files lấy từ
/// getAttachments): nguồn là MessageCache in-memory nên đằng nào cũng materialize hết,
/// paging chỉ là Skip/Take thừa. Client tự cắt (preview) hoặc render hết trong scroll (panel).
/// </summary>
public static class GetConversationLinks
{
    public record Request(string conversationId) : IRequest<GetConversationLinksResponse>;

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

    internal sealed class Handler : IRequestHandler<Request, GetConversationLinksResponse>
    {
        readonly IValidator<Request> _validator;
        readonly MessageCache _messageCache;

        public Handler(IValidator<Request> validator, MessageCache messageCache)
        {
            _validator = validator;
            _messageCache = messageCache;
        }

        public async Task<GetConversationLinksResponse> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var messages = await _messageCache.GetMessages(request.conversationId);

            var links = messages
                .Where(m => m.RecalledTime is null)
                .OrderByDescending(m => m.CreatedTime)
                .SelectMany(m =>
                {
                    // LinkPreviews (mới) ưu tiên; fallback LinkPreview (cũ) cho tin trước đây.
                    var previews = m.LinkPreviews.Any()
                        ? m.LinkPreviews
                        : m.LinkPreview is null ? new List<LinkPreview>() : new List<LinkPreview> { m.LinkPreview };
                    return previews.Select(p => new ConversationLinkItem
                    {
                        MessageId = m.Id,
                        ContactId = m.ContactId,
                        CreatedTime = m.CreatedTime,
                        Url = p.Url,
                        Title = p.Title,
                        Description = p.Description,
                        ImageUrl = p.ImageUrl,
                        SiteName = p.SiteName
                    });
                })
                .ToList();

            return new GetConversationLinksResponse { Links = links };
        }
    }
}

public class GetConversationLinksEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapGet("{conversationId}/links",
        async (ISender sender, string conversationId) =>
        {
            var result = await sender.Send(new GetConversationLinks.Request(conversationId));
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}
