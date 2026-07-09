namespace Presentation.Members;

/// <summary>
/// Đặt / xóa biệt danh cho một thành viên trong hội thoại nhóm (kiểu Messenger:
/// mọi thành viên đều thấy và đều được phép đặt). Nickname rỗng/null = xóa, về tên gốc.
/// Fanout data-only event để các client khác cập nhật ngay.
/// </summary>
public static class UpdateNickname
{
    public record Request(string conversationId, string contactId, string? nickname) : IRequest<Unit>;

    public record Body(string? Nickname);

    public class Validator : AbstractValidator<Request>
    {
        readonly IContactRepository _contactRepository;
        readonly IConversationRepository _conversationRepository;

        public Validator(IContactRepository contactRepository, IConversationRepository conversationRepository)
        {
            _contactRepository = contactRepository;
            _conversationRepository = conversationRepository;
            RuleFor(c => c.conversationId).ContactRelatedToConversation(_contactRepository, _conversationRepository);
            RuleFor(c => c.nickname).MaximumLength(50).WithMessage("Nickname must be at most 50 characters");
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        readonly IValidator<Request> _validator;
        readonly IContactRepository _contactRepository;
        readonly IConversationRepository _conversationRepository;
        readonly MemberCache _memberCache;
        readonly IFirebaseFunction _firebaseFunction;

        public Handler(IValidator<Request> validator, IContactRepository contactRepository, IConversationRepository conversationRepository, MemberCache memberCache, IFirebaseFunction firebaseFunction)
        {
            _validator = validator;
            _contactRepository = contactRepository;
            _conversationRepository = conversationRepository;
            _memberCache = memberCache;
            _firebaseFunction = firebaseFunction;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var userId = _contactRepository.GetUserId();
            // Chuẩn hóa: trim, rỗng → null (xóa biệt danh).
            var nickname = string.IsNullOrWhiteSpace(request.nickname) ? null : request.nickname.Trim();

            // Thành viên được đặt phải thuộc hội thoại.
            var members = await _memberCache.GetMembers(request.conversationId);
            var target = members?.SingleOrDefault(q => q.Contact.Id == request.contactId);
            if (target is null)
                throw new BadRequestException("Member not found in conversation");

            // Mongo (source of truth).
            var filter = Builders<Conversation>.Filter.Eq(c => c.Id, request.conversationId);
            var updates = Builders<Conversation>.Update.Set("Members.$[elem].Nickname", nickname);
            var arrayFilter = new BsonDocumentArrayFilterDefinition<Conversation>(
                new BsonDocument("elem.ContactId", request.contactId));
            // NoTrackingTime: đổi biệt danh không đẩy hội thoại lên đầu danh sách.
            _conversationRepository.UpdateNoTrackingTime(filter, updates, arrayFilter);

            // Redis member cache.
            target.Nickname = nickname;
            await _memberCache.UpdateMembers(request.conversationId, members!);

            // Data-only fanout cho các thành viên khác.
            await _firebaseFunction.Notify(
                ChatEventNames.MemberNicknameChanged,
                members!.Where(q => q.Contact.Id != userId).Select(q => q.Contact.Id).ToArray(),
                new EventMemberNicknameChanged
                {
                    ConversationId = request.conversationId,
                    ContactId = request.contactId,
                    Nickname = nickname,
                    ChangedBy = userId
                });

            return Unit.Value;
        }
    }
}

public class UpdateNicknameEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapPut("{conversationId}/members/{contactId}/nickname",
        async (ISender sender, string conversationId, string contactId, UpdateNickname.Body body) =>
        {
            await sender.Send(new UpdateNickname.Request(conversationId, contactId, body.Nickname));
            return Results.Ok();
        }).RequireAuthorization();
    }
}
