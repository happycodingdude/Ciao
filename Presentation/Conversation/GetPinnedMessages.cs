namespace Presentation.Conversations;

public static class GetPinnedMessages
{
    // keyword optional: server lọc theo nội dung tin khi FE không match trong list đã tải sẵn
    // (đồng bộ hành vi với GetConversationBookmarks).
    public record Request(string id, string? keyword) : IRequest<List<PinnedMessageResult>>;

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

    internal sealed class Handler : IRequestHandler<Request, List<PinnedMessageResult>>
    {
        readonly IValidator<Request> _validator;
        readonly IConversationRepository _conversationRepository;

        public Handler(IValidator<Request> validator, IConversationRepository conversationRepository)
        {
            _validator = validator;
            _conversationRepository = conversationRepository;
        }

        public async Task<List<PinnedMessageResult>> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var messages = await _conversationRepository.GetPinnedMessages(request.id, request.keyword, cancellationToken);

            // Content build thành chuỗi preview theo loại tin (media/sticker/poll...) —
            // cùng helper với lastMessage của danh sách hội thoại để nhất quán.
            return messages.Select(m => new PinnedMessageResult
            {
                Id = m.Id,
                CreatedTime = m.CreatedTime,
                Type = m.Type,
                Content = AppConstants.BuildLastMessagePreview(m.Type, m.Content, m.Attachments.Select(a => a.MediaName)),
                ContactId = m.ContactId,
                PinnedBy = m.PinnedBy
            }).ToList();
        }
    }
}

public class GetPinnedMessagesEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        // GET /api/v1/conversations/{id}/messages/pinned?keyword=...
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapGet("/{id}/messages/pinned",
        async (ISender sender, string id, string? keyword = null) =>
        {
            var query = new GetPinnedMessages.Request(id, keyword);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}
