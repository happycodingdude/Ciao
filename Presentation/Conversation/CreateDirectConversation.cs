namespace Presentation.Friends;

public static class CreateDirectConversation
{
    public record Request(string contactId, string message, bool isForward) : IRequest<CreateDirectConversationRes>;

    internal sealed class Handler : IRequestHandler<Request, CreateDirectConversationRes>
    {
        readonly IMapper _mapper;
        readonly IConversationRepository _conversationRepository;
        readonly IContactRepository _contactRepository;
        readonly IKafkaProducer _kafkaProducer;

        public Handler(IMapper mapper, IConversationRepository conversationRepository, IContactRepository contactRepository, IKafkaProducer kafkaProducer)
        {
            _mapper = mapper;
            _conversationRepository = conversationRepository;
            _contactRepository = contactRepository;
            _kafkaProducer = kafkaProducer;
        }

        public async Task<CreateDirectConversationRes> Handle(Request request, CancellationToken cancellationToken)
        {
            // Tìm cuộc trò chuyện trực tiếp giữa 2 người
            var userId = _contactRepository.GetUserId();
            var filter = Builders<Conversation>.Filter.And(
                Builders<Conversation>.Filter.ElemMatch(q => q.Members, w => w.ContactId == userId),
                Builders<Conversation>.Filter.ElemMatch(q => q.Members, w => w.ContactId == request.contactId),
                Builders<Conversation>.Filter.Eq(q => q.IsGroup, false)
            );
            var conversation = (await _conversationRepository.GetAllAsync(filter)).SingleOrDefault();
            // Đánh dấu cuộc trò chuyện mới và tạo cuộc trò chuyện nếu chưa có
            var isNewConversation = conversation is null;
            conversation ??= new Conversation
            {
                Id = ObjectId.GenerateNewId().ToString(),
                IsGroup = false
            };
            var message = string.IsNullOrEmpty(request.message)
                ? null
                : new NewDirectConversationModel_Message
                {
                    Id = ObjectId.GenerateNewId().ToString(),
                    Type = "text",
                    Content = request.message,
                    ContactId = userId,
                    IsForwarded = request.isForward
                };

            await _kafkaProducer.ProduceAsync(Topic.NewDirectConversation, new NewDirectConversationModel
            {
                UserId = _contactRepository.GetUserId(),
                ContactId = request.contactId,
                IsNewConversation = isNewConversation,
                Conversation = _mapper.Map<NewGroupConversationModel_Conversation>(conversation),
                Message = message
            });

            return new CreateDirectConversationRes
            {
                ConversationId = conversation.Id,
                MessageId = message?.Id
            };
        }
    }
}

public class CreateDirectConversationEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Contact).MapPost("/{contactId}/conversations",
        async (ISender sender, string contactId, CreateDirectConversationReq request) =>
        {
            var query = new CreateDirectConversation.Request(contactId, request.Message, request.IsForwarded);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}