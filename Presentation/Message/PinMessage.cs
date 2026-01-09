namespace Presentation.Messages;

public static class PinMessage
{
    public record Request(string conversationId, string id, bool pinned) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        readonly IContactRepository _contactRepository;
        readonly IConversationRepository _conversationRepository;

        public Validator(IServiceProvider serviceProvider)
        {
            using (var scope = serviceProvider.CreateScope())
            {
                _contactRepository = scope.ServiceProvider.GetRequiredService<IContactRepository>();
                _conversationRepository = scope.ServiceProvider.GetRequiredService<IConversationRepository>();
            }
            RuleFor(c => c.conversationId).ContactRelatedToConversation(_contactRepository, _conversationRepository);
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        readonly IValidator<Request> _validator;
        readonly IFirebaseFunction _firebaseFunction;
        readonly IContactRepository _contactRepository;
        readonly IConversationRepository _conversationRepository;
        readonly MessageCache _messageCache;
        readonly MemberCache _memberCache;

        public Handler(IValidator<Request> validator, IContactRepository contactRepository, IConversationRepository conversationRepository, MessageCache messageCache, IFirebaseFunction firebaseFunction, MemberCache memberCache)
        {
            _validator = validator;
            _contactRepository = contactRepository;
            _conversationRepository = conversationRepository;
            _messageCache = messageCache;
            _firebaseFunction = firebaseFunction;
            _memberCache = memberCache;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            // Cập nhật trạng thái pin của tin nhắn
            var filter = Builders<Conversation>.Filter.Eq(c => c.Id, request.conversationId);
            var updates = Builders<Conversation>.Update
                .Set("Messages.$[elem].IsPinned", request.pinned)
                .Set("Messages.$[elem].PinnedBy", _contactRepository.GetUserId());
            var arrayFilter = new BsonDocumentArrayFilterDefinition<Conversation>(
                new BsonDocument("elem._id", request.id)
                );
            _conversationRepository.UpdateNoTrackingTime(filter, updates, arrayFilter);

            // Cập nhật cache
            await _messageCache.UpdatePin(request.conversationId, request.id, _contactRepository.GetUserId(), request.pinned);

            // Gởi sự kiện lên UI
            var members = await _memberCache.GetMembers(request.conversationId);
            await _firebaseFunction.Notify(
                ChatEventNames.NewMessagePinned,
                members.Where(q => q.Contact.Id != _contactRepository.GetUserId()).Select(q => q.Contact.Id).ToArray(),
                new NotifyNewMessagePinnedModel
                {
                    UserId = _contactRepository.GetUserId(),
                    ConversationId = request.conversationId,
                    MessageId = request.id,
                    IsPinned = request.pinned,
                    PinnedBy = _contactRepository.GetUserId()
                }
            );

            return Unit.Value;
        }
    }
}

public class PinMessageEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapPut("{conversationId}/messages/{id}/pin",
        async (ISender sender, string conversationId, string id, bool pinned) =>
        {
            var query = new PinMessage.Request(conversationId, id, pinned);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization();
    }
}