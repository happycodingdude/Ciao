namespace Presentation.Messages;

public static class ReactMessage
{
    public record Request(string id, bool? isLike, bool? isLove, bool? isCare, bool? isWow, bool? isSad, bool? isAngry) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        readonly IContactRepository _contactRepository;
        readonly IConversationRepository _conversationRepository;

        public Validator(IServiceProvider serviceProvider)
        {
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        readonly IValidator<Request> _validator;
        readonly INotificationMethod _notificationMethod;
        readonly IMapper _mapper;
        readonly IConversationRepository _conversationRepository;
        readonly IContactRepository _contactRepository;

        public Handler(IValidator<Request> validator,
            INotificationMethod notificationMethod,
            IMapper mapper,
            IService<IConversationRepository> conversationService,
            IService<IContactRepository> contactService)
        {
            _validator = validator;
            _notificationMethod = notificationMethod;
            _mapper = mapper;
            _conversationRepository = conversationService.Get();
            _contactRepository = contactService.Get();
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var userId = _contactRepository.GetUserId();
            var conversationFilter = Builders<Conversation>.Filter.Eq("Messages._id", request.id);

            // UpdateDefinition<Conversation> conversationUpdates;
            // if (request.isLike.HasValue)
            // {
            //     conversationUpdates = Builders<Conversation>.Update.Set("Messages.$[elem].Reactions.IsLike", request.isLike);
            // }
            // else if (request.isLove.HasValue)
            // {
            //     conversationUpdates = Builders<Conversation>.Update.Set("Messages.$[elem].Reactions.isLove", request.isLove);
            // }
            // else if (request.isCare.HasValue)
            // {
            //     conversationUpdates = Builders<Conversation>.Update.Set("Messages.$[elem].Reactions.isCare", request.isCare);
            // }
            // else if (request.isWow.HasValue)
            // {
            //     conversationUpdates = Builders<Conversation>.Update.Set("Messages.$[elem].Reactions.isWow", request.isWow);
            // }
            // else if (request.isSad.HasValue)
            // {
            //     conversationUpdates = Builders<Conversation>.Update.Set("Messages.$[elem].Reactions.isSad", request.isSad);
            // }
            // else if (request.isAngry.HasValue)
            // {
            //     conversationUpdates = Builders<Conversation>.Update.Set("Messages.$[elem].Reactions.isAngry", request.isAngry);
            // }
            // else
            // {
            //     return Unit.Value;
            // }

            var conversationUpdates = Builders<Conversation>.Update.Combine(
    // Update the fields of an existing reaction
    Builders<Conversation>.Update.Set(
        "Messages.$.Reactions.$[elem].IsLike", request.isLike ?? false
    )
    .Set("Messages.$.Reactions.$[elem].IsLove", request.isLove ?? false)
    .Set("Messages.$.Reactions.$[elem].IsCare", request.isCare ?? false)
    .Set("Messages.$.Reactions.$[elem].IsWow", request.isWow ?? false)
    .Set("Messages.$.Reactions.$[elem].IsSad", request.isSad ?? false)
    .Set("Messages.$.Reactions.$[elem].IsAngry", request.isAngry ?? false),

    // Add a new reaction if it doesn't exist
    Builders<Conversation>.Update.Push(
        "Messages.$.Reactions",
        new MessageReaction
        {
            ContactId = userId,
            IsLike = request.isLike ?? false,
            IsLove = request.isLove ?? false,
            IsCare = request.isCare ?? false,
            IsWow = request.isWow ?? false,
            IsSad = request.isSad ?? false,
            IsAngry = request.isAngry ?? false
        }
    )
);

            var arrayFilter = new BsonDocumentArrayFilterDefinition<Conversation>(
                new BsonDocument("elem.Reactions.ContactId", userId)
                );
            _conversationRepository.UpdateNoTracking(conversationFilter, conversationUpdates, arrayFilter);

            return Unit.Value;
        }
    }
}

public class ReactMessageEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Message).MapPut("{id}/react",
        async (ISender sender, string id,
        bool? isLike, bool? isLove, bool? isCare, bool? isWow, bool? isSad, bool? isAngry) =>
        {
            var query = new ReactMessage.Request(id, isLike, isLove, isCare, isWow, isSad, isAngry);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}