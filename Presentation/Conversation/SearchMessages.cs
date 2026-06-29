namespace Presentation.Conversations;

public static class SearchMessages
{
    public record Request(string id, string keyword, int page, int limit) : IRequest<List<MessageSearchResult>>;

    public class Validator : AbstractValidator<Request>
    {
        readonly IContactRepository _contactRepository;
        readonly IConversationRepository _conversationRepository;

        public Validator(IContactRepository contactRepository, IConversationRepository conversationRepository)
        {
            _contactRepository = contactRepository;
            _conversationRepository = conversationRepository;
            // Reuse rule sẵn có: chỉ cho phép user là member của conversation được search.
            RuleFor(c => c.id).ContactRelatedToConversation(_contactRepository, _conversationRepository);
            // Keyword không rỗng/chỉ whitespace để tránh trả về toàn bộ message của conversation.
            RuleFor(c => c.keyword).NotEmpty().WithMessage("Keyword is required");
        }
    }

    internal sealed class Handler : IRequestHandler<Request, List<MessageSearchResult>>
    {
        readonly IValidator<Request> _validator;
        readonly IConversationRepository _conversationRepository;

        public Handler(IValidator<Request> validator, IConversationRepository conversationRepository)
        {
            _validator = validator;
            _conversationRepository = conversationRepository;
        }

        public async Task<List<MessageSearchResult>> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var paging = new PagingParam(request.page, request.limit);
            return await _conversationRepository.SearchMessages(request.id, request.keyword.Trim(), paging, cancellationToken);
        }
    }
}

public class SearchMessagesEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        // GET /api/v1/conversations/{id}/messages/search?keyword=...&page=1&limit=20
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapGet("/{id}/messages/search",
        async (ISender sender, string id, string keyword, int page = AppConstants.DefaultPage, int limit = AppConstants.DefaultLimit) =>
        {
            var query = new SearchMessages.Request(id, keyword, page, limit);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}
