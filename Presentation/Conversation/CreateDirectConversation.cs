namespace Presentation.Friends;

public static class CreateDirectConversation
{
    public record Request(string contactId, string message) : IRequest<string>;

    internal sealed class Handler : IRequestHandler<Request, string>
    {
        readonly IFirebaseFunction _firebase;
        readonly IMapper _mapper;
        readonly IConversationRepository _conversationRepository;
        readonly IContactRepository _contactRepository;
        readonly ConversationCache _conversationCache;

        public Handler(IFirebaseFunction firebase,
            IMapper mapper,
            IConversationRepository conversationRepository,
            IContactRepository contactRepository,
            ConversationCache conversationCache)
        {
            _firebase = firebase;
            _mapper = mapper;
            _conversationRepository = conversationRepository;
            _contactRepository = contactRepository;
            _conversationCache = conversationCache;
        }

        public async Task<string> Handle(Request request, CancellationToken cancellationToken)
        {
            var user = await _contactRepository.GetInfoAsync();
            var message = new Message
            {
                ContactId = user.Id,
                Type = "text",
                Content = request.message
            };
            var filter = Builders<Conversation>.Filter.And(
                Builders<Conversation>.Filter.ElemMatch(q => q.Participants, w => w.ContactId == user.Id),
                Builders<Conversation>.Filter.ElemMatch(q => q.Participants, w => w.ContactId == request.contactId),
                Builders<Conversation>.Filter.Eq(q => q.IsGroup, false)
            );
            var conversation = (await _conversationRepository.GetAllAsync(filter)).SingleOrDefault();
            // If no conversation exists -> create and return
            if (conversation is null)
            {
                var contactFilter = MongoQuery<Contact>.IdFilter(request.contactId);
                var contact = await _contactRepository.GetItemAsync(contactFilter);

                var newConversation = new Conversation();
                // Add target contact
                newConversation.Participants.Add(new Participant
                {
                    IsModerator = false,
                    IsDeleted = false,
                    IsNotifying = true,
                    ContactId = contact.Id
                });
                // Add this user
                newConversation.Participants.Add(new Participant
                {
                    IsModerator = true,
                    IsDeleted = false,
                    IsNotifying = true,
                    ContactId = contact.Id
                });
                // If send with message -> add new message
                if (!string.IsNullOrEmpty(request.message))
                    newConversation.Messages.Add(message);

                _conversationRepository.Add(newConversation);

                conversation = newConversation;
            }
            // If conversation exists -> update field IsDeleted if true then return
            else
            {
                var updateFilter = MongoQuery<Conversation>.IdFilter(conversation.Id);
                var currentUser = conversation.Participants.SingleOrDefault(q => q.ContactId == user.Id);
                if (currentUser.IsDeleted)
                {
                    conversation.Participants.ToList().ForEach(q =>
                    {
                        if (q.ContactId == user.Id) q.IsDeleted = false;
                    });
                }
                // If send with message -> add new message
                if (!string.IsNullOrEmpty(request.message))
                    conversation.Messages.Add(message);

                _conversationRepository.Replace(updateFilter, conversation);
            }

            // Update cache
            if (!string.IsNullOrEmpty(request.message))
                await _conversationCache.SetConversation(user.Id, _mapper.Map<ConversationCacheModel>(conversation), _mapper.Map<MessageWithReactions>(message));
            else
                await _conversationCache.SetConversation(user.Id, _mapper.Map<ConversationCacheModel>(conversation));

            // If send with message -> push message
            if (!string.IsNullOrEmpty(request.message))
            {
                var notify = _mapper.Map<MessageToNotify>(message);
                notify.Conversation = _mapper.Map<ConversationToNotify>(conversation);
                notify.Contact = _mapper.Map<MessageToNotify_Contact>(user);
                _ = _firebase.Notify(
                    "NewMessage",
                    conversation.Participants
                        .Where(q => q.ContactId != user.Id)
                        .Select(q => q.ContactId)
                    .ToArray(),
                    notify
                );
            }

            return conversation.Id;
        }
    }
}

public class CreateDirectConversationEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Contact).MapPost("/{contactId}/conversations",
        async (ISender sender, string contactId, string message) =>
        {
            var query = new CreateDirectConversation.Request(contactId, message);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}