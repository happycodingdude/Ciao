namespace Presentation.Conversations;

// Lấy cửa sổ tin nhắn quanh 1 messageId (mặc định 5 trước + 5 sau) — phục vụ pane review
// notification: tin được mention/react có thể nằm sâu trong lịch sử, không có trong page 1.
public static class GetMessagesAround
{
    public record Request(string id, string messageId, int radius) : IRequest<MessagesWithHasMore>;

    public class Validator : AbstractValidator<Request>
    {
        readonly IContactRepository _contactRepository;
        readonly IConversationRepository _conversationRepository;

        public Validator(IContactRepository contactRepository, IConversationRepository conversationRepository)
        {
            _contactRepository = contactRepository;
            _conversationRepository = conversationRepository;
            RuleFor(c => c.id).ContactRelatedToConversation(_contactRepository, _conversationRepository);
        }
    }

    internal sealed class Handler : IRequestHandler<Request, MessagesWithHasMore>
    {
        readonly IValidator<Request> _validator;
        readonly IContactRepository _contactRepository;
        readonly IMapper _mapper;
        readonly MessageCache _messageCache;

        public Handler(IValidator<Request> validator,
            IContactRepository contactRepository,
            IMapper mapper,
            MessageCache messageCache)
        {
            _validator = validator;
            _contactRepository = contactRepository;
            _mapper = mapper;
            _messageCache = messageCache;
        }

        public async Task<MessagesWithHasMore> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var userId = _contactRepository.GetUserId();
            var radius = request.radius > 0 ? request.radius : 5;

            var messages = await _messageCache.GetMessages(request.id);
            if (messages is null || messages.Count == 0)
                return new MessagesWithHasMore { Messages = new(), HasMore = false };

            // Cùng thứ tự hiển thị cũ→mới với GetMessages (FE render mới ở dưới).
            var ordered = messages.OrderBy(q => q.CreatedTime).ToList();
            var index = ordered.FindIndex(q => q.Id == request.messageId);

            int start, end;
            if (index < 0)
            {
                // Không tìm thấy (cache evict / tin đã xoá) → trả cửa sổ tin mới nhất để pane không rỗng.
                end = ordered.Count - 1;
                start = Math.Max(0, end - 2 * radius);
            }
            else
            {
                start = Math.Max(0, index - radius);
                end = Math.Min(ordered.Count - 1, index + radius);
            }

            var window = ordered.GetRange(start, end - start + 1);
            var result = _mapper.Map<List<MessageReactionSummary>>(window);
            for (int i = 0; i < result.Count; i++)
                result[i].CurrentReaction = window[i].Reactions.SingleOrDefault(q => q.ContactId == userId)?.Type;

            return new MessagesWithHasMore
            {
                Messages = result, // đã theo thứ tự cũ→mới
                HasMore = start > 0 // còn tin cũ hơn trước cửa sổ
            };
        }
    }
}

public class GetMessagesAroundEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapGet("/{id}/messages/around",
        async (ISender sender, string id, string messageId, int radius = 5) =>
        {
            var query = new GetMessagesAround.Request(id, messageId, radius);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}
