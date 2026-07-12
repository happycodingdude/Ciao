namespace Presentation.Invites;

/// <summary>
/// Phase 5 — Đợt 2: quản trị thu hồi link mời — set Invite = null, link cũ vô hiệu ngay
/// (mọi lượt mở/join theo code cũ sẽ không match filter Invite.Code). Idempotent.
/// Yêu cầu tham gia đang chờ KHÔNG bị xóa — quản trị vẫn duyệt/từ chối được.
/// </summary>
public static class RevokeGroupInvite
{
    public record Request(string conversationId) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        public Validator(IContactRepository contactRepository, IConversationRepository conversationRepository)
        {
            RuleFor(c => c.conversationId).MustBeGroupModerator(contactRepository, conversationRepository);
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        readonly IValidator<Request> _validator;
        readonly IConversationRepository _conversationRepository;
        readonly IUnitOfWork _uow;

        public Handler(IValidator<Request> validator, IConversationRepository conversationRepository, IUnitOfWork uow)
        {
            _validator = validator;
            _conversationRepository = conversationRepository;
            _uow = uow;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            _conversationRepository.UpdateNoTrackingTime(
                MongoQuery<Conversation>.IdFilter(request.conversationId),
                Builders<Conversation>.Update.Set(c => c.Invite, null));
            await _uow.SaveAsync();

            return Unit.Value;
        }
    }
}

public class RevokeGroupInviteEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapDelete("/{conversationId}/invite",
        async (ISender sender, string conversationId) =>
        {
            await sender.Send(new RevokeGroupInvite.Request(conversationId));
            return Results.Ok();
        }).RequireAuthorization();
    }
}
