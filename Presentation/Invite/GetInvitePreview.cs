namespace Presentation.Invites;

/// <summary>
/// Phase 5 — Đợt 2: người có link mở /invite/{code} → xem trước nhóm (tên, avatar, số thành viên)
/// và trạng thái với chính mình (đã là thành viên / đã gửi yêu cầu chờ duyệt). Yêu cầu đăng nhập.
/// Code không match / đã thu hồi → Invalid; hết hạn → Expired — KHÔNG lộ thông tin nhóm ở 2 case này
/// (link cũ không còn là "chìa khóa" hợp lệ). ConversationId chỉ trả khi đã là thành viên.
/// </summary>
public static class GetInvitePreview
{
    public record Request(string code) : IRequest<Response>;

    // Status: "active" | "invalid" | "expired"
    public record Response(string Status, string? ConversationId, string? Title, string? Avatar,
        int MemberCount, bool RequireApproval, bool IsMember, bool HasPendingRequest);

    public class Validator : AbstractValidator<Request>
    {
        public Validator()
        {
            RuleFor(c => c.code).NotEmpty().MaximumLength(64);
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Response>
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

        public async Task<Response> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var filter = Builders<Conversation>.Filter.And(
                Builders<Conversation>.Filter.Eq("Invite.Code", request.code),
                Builders<Conversation>.Filter.Eq(c => c.IsGroup, true));
            var conversation = await _conversationRepository.GetItemAsync(filter);
            if (conversation?.Invite is null)
                return new Response("invalid", null, null, null, 0, false, false, false);

            if (conversation.Invite.ExpireTime is not null && conversation.Invite.ExpireTime < DateTime.UtcNow)
                return new Response("expired", null, null, null, 0, false, false, false);

            var userId = _contactRepository.GetUserId();
            var isMember = conversation.Members.Any(m => m.ContactId == userId && !m.IsDeleted);
            var hasPendingRequest = conversation.JoinRequests.Any(r => r.ContactId == userId);

            return new Response("active",
                isMember ? conversation.Id : null,
                conversation.Title,
                conversation.Avatar,
                conversation.Members.Count(m => !m.IsDeleted),
                conversation.Invite.RequireApproval,
                isMember,
                hasPendingRequest);
        }
    }
}

public class GetInvitePreviewEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Invite).MapGet("/{code}",
        async (ISender sender, string code) =>
        {
            var result = await sender.Send(new GetInvitePreview.Request(code));
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}
