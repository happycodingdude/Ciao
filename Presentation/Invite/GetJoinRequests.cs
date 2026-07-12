namespace Presentation.Invites;

/// <summary>
/// Phase 5 — Đợt 2: quản trị xem hàng chờ yêu cầu tham gia của nhóm (pending-only),
/// kèm tên + avatar người xin để duyệt/từ chối. Sắp theo thời điểm gửi cũ → mới.
/// Hàng chờ thực tế nhỏ (pull ngay khi duyệt/từ chối/rút) → không phân trang.
/// </summary>
public static class GetJoinRequests
{
    public record Request(string conversationId) : IRequest<List<Response>>;

    public record Response(string ContactId, string Name, string Avatar, DateTime RequestedTime);

    public class Validator : AbstractValidator<Request>
    {
        public Validator(IContactRepository contactRepository, IConversationRepository conversationRepository)
        {
            RuleFor(c => c.conversationId).MustBeGroupModerator(contactRepository, conversationRepository);
        }
    }

    internal sealed class Handler : IRequestHandler<Request, List<Response>>
    {
        readonly IValidator<Request> _validator;
        readonly IContactRepository _contactRepository;
        readonly IConversationRepository _conversationRepository;

        public Handler(IValidator<Request> validator, IContactRepository contactRepository, IConversationRepository conversationRepository)
        {
            _validator = validator;
            _contactRepository = contactRepository;
            _conversationRepository = conversationRepository;
        }

        public async Task<List<Response>> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var conversation = await _conversationRepository.GetItemAsync(MongoQuery<Conversation>.IdFilter(request.conversationId));
            if (conversation.JoinRequests.Count == 0) return new List<Response>();

            var requesterIds = conversation.JoinRequests.Select(r => r.ContactId).ToList();
            var contacts = await _contactRepository.GetAllAsync(
                Builders<Contact>.Filter.Where(c => requesterIds.Contains(c.Id)));
            var contactMap = contacts.ToDictionary(c => c.Id);

            return conversation.JoinRequests
                .OrderBy(r => r.RequestedTime)
                .Select(r => new Response(
                    r.ContactId,
                    contactMap.GetValueOrDefault(r.ContactId)?.Name ?? "",
                    contactMap.GetValueOrDefault(r.ContactId)?.Avatar ?? "",
                    r.RequestedTime))
                .ToList();
        }
    }
}

public class GetJoinRequestsEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapGet("/{conversationId}/join-requests",
        async (ISender sender, string conversationId) =>
        {
            var result = await sender.Send(new GetJoinRequests.Request(conversationId));
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}
