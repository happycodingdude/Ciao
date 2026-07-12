namespace Presentation.Invites;

/// <summary>
/// Phase 5 — Đợt 2: quản trị xem link mời hiện tại của nhóm (null = chưa tạo/đã thu hồi).
/// Chỉ quản trị viên thấy được code — thành viên thường muốn mời thì nhờ quản trị chia sẻ link.
/// </summary>
public static class GetGroupInvite
{
    public record Request(string conversationId) : IRequest<Response>;

    public record Response(InviteDto? Invite);

    public class Validator : AbstractValidator<Request>
    {
        public Validator(IContactRepository contactRepository, IConversationRepository conversationRepository)
        {
            RuleFor(c => c.conversationId).MustBeGroupModerator(contactRepository, conversationRepository);
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Response>
    {
        readonly IValidator<Request> _validator;
        readonly IConversationRepository _conversationRepository;

        public Handler(IValidator<Request> validator, IConversationRepository conversationRepository)
        {
            _validator = validator;
            _conversationRepository = conversationRepository;
        }

        public async Task<Response> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var conversation = await _conversationRepository.GetItemAsync(MongoQuery<Conversation>.IdFilter(request.conversationId));
            return new Response(InviteDto.From(conversation.Invite));
        }
    }
}

public class GetGroupInviteEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapGet("/{conversationId}/invite",
        async (ISender sender, string conversationId) =>
        {
            var result = await sender.Send(new GetGroupInvite.Request(conversationId));
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}
