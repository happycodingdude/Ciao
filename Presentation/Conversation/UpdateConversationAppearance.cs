namespace Presentation.Conversations;

/// <summary>
/// Cập nhật giao diện chat CHUNG của một hội thoại: hình nền (wallpaper) và màu bong bóng
/// (bubbleColor) — lưu key preset trên chính Conversation, MỌI thành viên đều thấy
/// (rev 2: trước đây per-user trên Member, chuyển lên conversation-level theo yêu cầu
/// đồng bộ theme). null/rỗng = về mặc định.
/// Fast path (rev 5): endpoint chỉ validate + patch Redis + produce Kafka rồi trả response
/// ngay; Mongo persist ở DataStoreConsumer, fanout FCM ở NotificationConsumer.
/// </summary>
public static class UpdateConversationAppearance
{
    public record Request(string conversationId, string? wallpaper, string? bubbleColor) : IRequest<Response>;

    // Trả về tin hệ thống "{user} changed the chat theme" vừa persist để FE của NGƯỜI ĐỔI
    // append ngay vào khung chat (member khác nhận cùng payload qua event).
    public record Response(EventSystemMessage SystemMessage);

    public record Body(string? Wallpaper, string? BubbleColor);

    public class Validator : AbstractValidator<Request>
    {
        readonly IContactRepository _contactRepository;
        readonly IConversationRepository _conversationRepository;

        public Validator(IContactRepository contactRepository, IConversationRepository conversationRepository)
        {
            _contactRepository = contactRepository;
            _conversationRepository = conversationRepository;
            // Gộp membership + quyền trưởng nhóm vào 1 rule = 1 lần fetch conversation
            // (doc embed toàn bộ Messages nên fetch nặng — trước đây 2 rule fetch 2 lần).
            // Nhóm: chỉ trưởng nhóm (IsModerator) được đổi theme; chat 1-1 không có
            // trưởng nhóm nên cả hai phía đều đổi được.
            RuleFor(c => c).CustomAsync(async (req, ctx, ct) =>
            {
                var userId = _contactRepository.GetUserId();
                var conversation = await _conversationRepository.GetItemAsync(MongoQuery<Conversation>.IdFilter(req.conversationId));
                var member = conversation?.Members.FirstOrDefault(m => m.ContactId == userId);
                if (conversation is null || member is null)
                {
                    ctx.AddFailure("Not related to this conversation");
                    return;
                }
                if (conversation.IsGroup && (!member.IsModerator || member.IsDeleted))
                    ctx.AddFailure("Only the group leader can change the chat theme");
            });
            // Key preset ngắn — chặn payload rác.
            RuleFor(c => c.wallpaper).MaximumLength(50);
            RuleFor(c => c.bubbleColor).MaximumLength(50);
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Response>
    {
        readonly IValidator<Request> _validator;
        readonly IContactRepository _contactRepository;
        readonly ConversationCache _conversationCache;
        readonly MessageCache _messageCache;
        readonly IMapper _mapper;
        readonly IKafkaProducer _kafkaProducer;

        public Handler(IValidator<Request> validator, IContactRepository contactRepository, ConversationCache conversationCache, MessageCache messageCache, IMapper mapper, IKafkaProducer kafkaProducer)
        {
            _validator = validator;
            _contactRepository = contactRepository;
            _conversationCache = conversationCache;
            _messageCache = messageCache;
            _mapper = mapper;
            _kafkaProducer = kafkaProducer;
        }

        // Tên hiển thị của các key preset (theme sự kiện + preset riêng lẻ) — chỉ key đã biết
        // mới được nêu tên trong tin hệ thống; key lạ (payload tùy ý ≤50 ký tự) không được
        // echo vào nội dung persist.
        static readonly Dictionary<string, string> ThemeDisplayNames = new(StringComparer.OrdinalIgnoreCase)
        {
            ["noel"] = "Noel",
            ["halloween"] = "Halloween",
            ["valentine"] = "Valentine",
            ["mint"] = "Mint",
            ["sunset"] = "Sunset",
            ["lavender"] = "Lavender",
            ["rose"] = "Rose",
            ["graphite"] = "Graphite",
            ["blue"] = "Blue",
            ["teal"] = "Teal",
            ["violet"] = "Violet",
            ["amber"] = "Amber",
        };

        static string BuildSystemMessageContent(string? userName, string? wallpaper, string? bubbleColor)
        {
            if (wallpaper is null && bubbleColor is null)
                return AppConstants.SystemMessage_ResetTheme.Replace("{user}", userName);
            // Hàng Themes gửi cùng 1 key cho cả 2 field → nêu được tên theme; trường hợp
            // 2 field lệch nhau (2 hàng riêng lẻ, hiện đang ẩn) → fallback câu chung.
            if (wallpaper == bubbleColor && wallpaper is not null && ThemeDisplayNames.TryGetValue(wallpaper, out var themeName))
                return AppConstants.SystemMessage_ChangedThemeTo.Replace("{user}", userName).Replace("{theme}", themeName);
            return AppConstants.SystemMessage_ChangedTheme.Replace("{user}", userName);
        }

        public async Task<Response> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var userId = _contactRepository.GetUserId();
            var wallpaper = string.IsNullOrWhiteSpace(request.wallpaper) ? null : request.wallpaper;
            var bubbleColor = string.IsNullOrWhiteSpace(request.bubbleColor) ? null : request.bubbleColor;

            // Dòng hệ thống "{user} changed the chat theme to {theme}" — build tại endpoint
            // (id thật) để trả response ngay; Mongo persist ở DataStoreConsumer.
            var user = await _contactRepository.GetInfoAsync(userId);
            var systemMessage = new SystemMessage(BuildSystemMessageContent(user?.Name, wallpaper, bubbleColor));
            var messageToAdd = _mapper.Map<Message>(systemMessage);

            // Patch Redis message cache để GetMessages (member online mở lại chat) có ngay dòng hệ thống.
            await _messageCache.AddSystemMessage(request.conversationId, _mapper.Map<MessageWithReactions>(messageToAdd));

            // Patch Redis conversation-info cache để reload/GetConversations trả giá trị mới ngay.
            var conversationInfo = await _conversationCache.GetConversationInfo(request.conversationId);
            if (conversationInfo is not null)
            {
                conversationInfo.Wallpaper = wallpaper;
                conversationInfo.BubbleColor = bubbleColor;
                await _conversationCache.SetConversation(request.conversationId, conversationInfo);
            }

            var eventSystemMessage = new EventSystemMessage
            {
                Id = messageToAdd.Id,
                Type = messageToAdd.Type,
                Content = messageToAdd.Content,
                ContactId = messageToAdd.ContactId,
                CreatedTime = messageToAdd.CreatedTime
            };

            // Đẩy phần nặng ra khỏi request path: DataStoreConsumer persist Mongo
            // (theme + system message) rồi phát tiếp cho NotificationConsumer fanout FCM.
            // Response trả ngay — actor đã thấy theme mới (optimistic FE) + dòng hệ thống (id thật).
            await _kafkaProducer.ProduceAsync(Topic.ConversationAppearanceChanged, new ConversationAppearanceChangedModel
            {
                UserId = userId,
                ConversationId = request.conversationId,
                Wallpaper = wallpaper,
                BubbleColor = bubbleColor,
                Message = messageToAdd
            });

            return new Response(eventSystemMessage);
        }
    }
}

public class UpdateConversationAppearanceEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapPut("{conversationId}/appearance",
        async (ISender sender, string conversationId, UpdateConversationAppearance.Body body) =>
        {
            var result = await sender.Send(new UpdateConversationAppearance.Request(conversationId, body.Wallpaper, body.BubbleColor));
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}
