namespace Presentation.Conversations;

/// <summary>
/// Danh sách liên kết đã gửi trong hội thoại (cho tab "Liên kết" của phần Media).
/// Gom từ LinkPreviews của các tin text còn hiệu lực (bỏ tin đã thu hồi), mới trước, phân trang.
/// </summary>
public static class GetConversationLinks
{
    public record Request(string conversationId, int page, int limit) : IRequest<GetConversationLinksResponse>;

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

            var paging = new PagingParam(request.page, request.limit);
            var messages = await _messageCache.GetMessages(request.conversationId);

            var allLinks = messages
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

            var pageItems = allLinks.Skip(paging.Skip).Take(paging.Limit).ToList();
            return new GetConversationLinksResponse
            {
                HasMore = allLinks.Count > paging.Skip + paging.Limit,
                Links = pageItems
            };
        }
    }
}

public class GetConversationLinksEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapGet("{conversationId}/links",
        async (ISender sender, string conversationId, int page = AppConstants.DefaultPage, int limit = AppConstants.DefaultLimit) =>
        {
            var result = await sender.Send(new GetConversationLinks.Request(conversationId, page, limit));
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}
