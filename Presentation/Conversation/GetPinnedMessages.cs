namespace Presentation.Conversations;

/// <summary>
/// Panel "Tin đã ghim" của hội thoại — phân trang (mới ghim trước). Nội dung resolve LIVE từ
/// message cache (Redis) → phản ánh edit/recall mới nhất; tin recall/mất → IsUnavailable.
/// Luồng đồng nhất với "Tin đã lưu" (Bookmark): đọc từ collection PinnedMessage rồi làm giàu nội dung.
/// - keyword rỗng: phân trang theo page/limit (dùng cho load-more).
/// - keyword có: chế độ search — resolve toàn bộ, lọc theo nội dung (FE fallback khi filter
///   client-side không match), trả toàn bộ match (HasMore=false).
/// </summary>
public static class GetPinnedMessages
{
    public record Request(string id, int page, int limit, string? keyword) : IRequest<GetPinnedMessagesResponse>;

    public class Validator : AbstractValidator<Request>
    {
        readonly IContactRepository _contactRepository;
        readonly IConversationRepository _conversationRepository;

        public Validator(IContactRepository contactRepository, IConversationRepository conversationRepository)
        {
            _contactRepository = contactRepository;
            _conversationRepository = conversationRepository;
            // Reuse rule sẵn có: chỉ member của conversation mới xem được danh sách tin ghim.
            RuleFor(c => c.id).ContactRelatedToConversation(_contactRepository, _conversationRepository);
        }
    }

    internal sealed class Handler : IRequestHandler<Request, GetPinnedMessagesResponse>
    {
        readonly IValidator<Request> _validator;
        readonly IPinnedMessageRepository _pinnedMessageRepository;
        readonly MessageCache _messageCache;

        public Handler(IValidator<Request> validator, IPinnedMessageRepository pinnedMessageRepository, MessageCache messageCache)
        {
            _validator = validator;
            _pinnedMessageRepository = pinnedMessageRepository;
            _messageCache = messageCache;
        }

        public async Task<GetPinnedMessagesResponse> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var filter = Builders<PinnedMessage>.Filter.Eq(q => q.ConversationId, request.id);
            var keyword = request.keyword?.Trim();
            var searchMode = !string.IsNullOrEmpty(keyword);

            // Search mode: nạp toàn bộ để lọc theo nội dung (số tin ghim của 1 hội thoại nhỏ).
            // Browse mode: phân trang, lấy dư 1 bản ghi để tính HasMore không cần count riêng.
            var paging = new PagingParam(request.page, request.limit);
            List<PinnedMessage> pins;
            bool hasMore = false;
            if (searchMode)
            {
                pins = (await _pinnedMessageRepository.GetAllAsync(filter))
                    .OrderByDescending(q => q.CreatedTime)
                    .ToList();
            }
            else
            {
                pins = (await _pinnedMessageRepository.GetPagedAsync(filter,
                    new PagingParam(request.page, request.limit + 1))).ToList();
                hasMore = pins.Count > paging.Limit;
                if (hasMore) pins = pins.Take(paging.Limit).ToList();
            }

            var result = new GetPinnedMessagesResponse { HasMore = hasMore };
            if (pins.Count == 0) return result;

            // Resolve nội dung LIVE từ message cache (1 lần đọc cache cho cả hội thoại).
            var messages = await _messageCache.GetMessages(request.id);

            foreach (var pin in pins)
            {
                var message = messages?.SingleOrDefault(q => q.Id == pin.MessageId);
                var isUnavailable = message is null || message.RecalledTime is not null;
                var content = isUnavailable
                    ? string.Empty
                    : AppConstants.BuildLastMessagePreview(message!.Type, message.Content, message.Attachments.Select(a => a.MediaName));

                // Search mode: bỏ tin unavailable (không còn nội dung để khớp) + lọc theo keyword.
                if (searchMode
                    && (isUnavailable || !content.Contains(keyword!, StringComparison.OrdinalIgnoreCase)))
                    continue;

                result.Items.Add(new PinnedMessageItem
                {
                    Id = pin.Id,
                    MessageId = pin.MessageId,
                    Type = message?.Type ?? string.Empty,
                    Content = content,
                    ContactId = message?.ContactId ?? string.Empty,
                    PinnedBy = pin.PinnedBy,
                    MessageCreatedTime = message?.CreatedTime,
                    PinnedTime = pin.CreatedTime,
                    IsUnavailable = isUnavailable
                });
            }

            return result;
        }
    }
}

public class GetPinnedMessagesEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        // GET /api/v1/conversations/{id}/messages/pinned?page=&limit=&keyword=
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapGet("/{id}/messages/pinned",
        async (ISender sender, string id, int page = AppConstants.DefaultPage, int limit = AppConstants.DefaultLimit, string? keyword = null) =>
        {
            var result = await sender.Send(new GetPinnedMessages.Request(id, page, limit, keyword));
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}
