namespace Presentation.Friends;

public static class CreateConversationByContactId
{
    public record Request(string contactId) : IRequest<string>;

    internal sealed class Handler : IRequestHandler<Request, string>
    {
        readonly IMapper _mapper;
        readonly IFriendRepository _friendRepository;
        readonly IConversationRepository _conversationRepository;
        readonly IContactRepository _contactRepository;

        public Handler(IMapper mapper,
            IService<IFriendRepository> friendService,
            IService<IConversationRepository> conversationService,
            IService<IContactRepository> contactService)
        {
            _mapper = mapper;
            _friendRepository = friendService.Get();
            _conversationRepository = conversationService.Get();
            _contactRepository = contactService.Get();
        }

        public async Task<string> Handle(Request request, CancellationToken cancellationToken)
        {
            var user = await _contactRepository.GetInfoAsync();
            var filter = Builders<Conversation>.Filter.And(
                Builders<Conversation>.Filter.ElemMatch(q => q.Participants, w => w.Contact.Id == user.Id),
                Builders<Conversation>.Filter.ElemMatch(q => q.Participants, w => w.Contact.Id == request.contactId),
                Builders<Conversation>.Filter.Eq(q => q.IsGroup, false)
            );
            var conversation = (await _conversationRepository.GetAllAsync(filter)).SingleOrDefault();
            // If no conversation exists -> create and return
            if (conversation == null)
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
                    Contact = new Message_Contact
                    {
                        Id = contact.Id,
                        Name = contact.Name,
                        Avatar = contact.Avatar,
                        IsOnline = contact.IsOnline
                    }
                });
                // Add this user
                newConversation.Participants.Add(new Participant
                {
                    IsModerator = true,
                    IsDeleted = false,
                    IsNotifying = true,
                    Contact = new Message_Contact
                    {
                        Id = user.Id,
                        Name = user.Name,
                        Avatar = user.Avatar,
                        IsOnline = true
                    }
                });

                _conversationRepository.Add(newConversation);

                return newConversation.Id;
            }
            // If conversation exists -> update field IsDeleted if true then return
            else
            {
                var currentUser = conversation.Participants.FirstOrDefault(q => q.Contact.Id == user.Id);
                if (currentUser.IsDeleted)
                {
                    var conversationFilter = Builders<Conversation>.Filter.Eq("Participants._id", currentUser.Id);
                    var conversationUpdates = Builders<Conversation>.Update
                        .Set("Participants.$[elem].IsDeleted", false);
                    var arrayFilter = new BsonDocumentArrayFilterDefinition<Conversation>(
                        new BsonDocument("elem._id", currentUser.Id)
                        );
                    _conversationRepository.Update(conversationFilter, conversationUpdates, arrayFilter);
                }
                return conversation.Id;
            }
        }
    }
}

public class CreateConversationByContactIdEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Contact).MapPost("/{contactId}/conversations",
        async (ISender sender, string contactId) =>
        {
            var query = new CreateConversationByContactId.Request(contactId);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}