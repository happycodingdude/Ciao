namespace Presentation.Friends;

// Endpoint đọc-thuần: trả về id hội thoại trực tiếp (1-1) đã tồn tại giữa user hiện
// tại và contact, hoặc null nếu chưa có. Mục đích: cho FE xác định nhanh "đã có hội
// thoại chưa" mà KHÔNG phải tải lần lượt toàn bộ trang danh sách chat (deep-find) —
// đặc biệt khi nhắn cho người chưa từng trò chuyện (danh sách rất dài). Không tạo mới,
// không side-effect (khác POST create lookup-or-create).
public static class GetDirectConversationId
{
    public record Request(string contactId) : IRequest<GetDirectConversationIdRes>;

    internal sealed class Handler : IRequestHandler<Request, GetDirectConversationIdRes>
    {
        readonly IConversationRepository _conversationRepository;
        readonly IContactRepository _contactRepository;

        public Handler(IConversationRepository conversationRepository, IContactRepository contactRepository)
        {
            _conversationRepository = conversationRepository;
            _contactRepository = contactRepository;
        }

        public async Task<GetDirectConversationIdRes> Handle(Request request, CancellationToken cancellationToken)
        {
            var userId = _contactRepository.GetUserId();
            // Cùng filter với CreateDirectConversation để đảm bảo nhất quán id trả về.
            var filter = Builders<Conversation>.Filter.And(
                Builders<Conversation>.Filter.ElemMatch(q => q.Members, w => w.ContactId == userId),
                Builders<Conversation>.Filter.ElemMatch(q => q.Members, w => w.ContactId == request.contactId),
                Builders<Conversation>.Filter.Eq(q => q.IsGroup, false)
            );
            // OrderBy(Id).FirstOrDefault: nếu lỡ có hội thoại trùng (do create không atomic)
            // thì hội tụ ổn định về hội thoại cũ nhất — khớp CreateDirectConversation.
            var conversation = (await _conversationRepository.GetAllAsync(filter))
                .OrderBy(q => q.Id)
                .FirstOrDefault();

            return new GetDirectConversationIdRes { ConversationId = conversation?.Id };
        }
    }
}

public class GetDirectConversationIdEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Contact).MapGet("/{contactId}/conversations/direct",
        async (ISender sender, string contactId) =>
        {
            var result = await sender.Send(new GetDirectConversationId.Request(contactId));
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}
