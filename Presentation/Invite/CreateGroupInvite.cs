using System.Security.Cryptography;

namespace Presentation.Invites;

/// <summary>
/// Phase 5 — Đợt 2: quản trị tạo link mời nhóm (tạo mới hoặc thay link cũ — mỗi nhóm 1 link
/// active, code mới làm link cũ vô hiệu ngay). Tùy chọn: cần duyệt (RequireApproval) và
/// thời hạn (expiresInHours, null = vĩnh viễn). Mongo là source of truth — lookup theo
/// Invite.Code khi người khác mở link, không cache.
/// </summary>
public static class CreateGroupInvite
{
    public record Request(string conversationId, bool requireApproval, int? expiresInHours) : IRequest<Response>;

    public record Response(InviteDto Invite);

    public record Body(bool RequireApproval, int? ExpiresInHours);

    public class Validator : AbstractValidator<Request>
    {
        public Validator(IContactRepository contactRepository, IConversationRepository conversationRepository)
        {
            RuleFor(c => c.conversationId).MustBeGroupModerator(contactRepository, conversationRepository);
            // Trần 30 ngày — chặn giá trị rác/âm; null = không hết hạn.
            RuleFor(c => c.expiresInHours).InclusiveBetween(1, 720).When(c => c.expiresInHours is not null);
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Response>
    {
        readonly IValidator<Request> _validator;
        readonly IContactRepository _contactRepository;
        readonly IConversationRepository _conversationRepository;
        readonly IUnitOfWork _uow;

        public Handler(IValidator<Request> validator, IContactRepository contactRepository,
            IConversationRepository conversationRepository, IUnitOfWork uow)
        {
            _validator = validator;
            _contactRepository = contactRepository;
            _conversationRepository = conversationRepository;
            _uow = uow;
        }

        public async Task<Response> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var invite = new GroupInvite
            {
                // 128-bit crypto-random, hex — không đoán được, an toàn đặt trong URL.
                Code = Convert.ToHexString(RandomNumberGenerator.GetBytes(16)).ToLowerInvariant(),
                RequireApproval = request.requireApproval,
                ExpireTime = request.expiresInHours is null
                    ? null
                    : DateTime.UtcNow.AddHours(request.expiresInHours.Value),
                CreatedBy = _contactRepository.GetUserId(),
                CreatedTime = DateTime.UtcNow
            };

            // NoTrackingTime: tạo link không đẩy hội thoại lên đầu danh sách.
            _conversationRepository.UpdateNoTrackingTime(
                MongoQuery<Conversation>.IdFilter(request.conversationId),
                Builders<Conversation>.Update.Set(c => c.Invite, invite));
            await _uow.SaveAsync();

            return new Response(InviteDto.From(invite)!);
        }
    }
}

public class CreateGroupInviteEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapPost("/{conversationId}/invite",
        async (ISender sender, string conversationId, CreateGroupInvite.Body body) =>
        {
            var result = await sender.Send(new CreateGroupInvite.Request(conversationId, body.RequireApproval, body.ExpiresInHours));
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}
