namespace Presentation.Friends;

public static class CreateConversationByContactId
{
    public record Request(string contactId, string message) : IRequest<string>;

    internal sealed class Handler : IRequestHandler<Request, string>
    {
        readonly IConversationRepository _conversationRepository;
        readonly IContactRepository _contactRepository;

        public Handler(IService<IConversationRepository> conversationService, IService<IContactRepository> contactService)
        {
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
                // If send with message -> add new message
                if (request.message is not null)
                {
                    newConversation.Messages.Add(new Message
                    {
                        ContactId = user.Id,
                        Type = "text",
                        Content = request.message
                    });
                }

                _conversationRepository.Add(newConversation);

                return newConversation.Id;
            }
            // If conversation exists -> update field IsDeleted if true then return
            else
            {
                var updateFilter = MongoQuery<Conversation>.IdFilter(conversation.Id);
                var currentUser = conversation.Participants.SingleOrDefault(q => q.Contact.Id == user.Id);
                // Update 
                if (currentUser.IsDeleted)
                {
                    conversation.Participants.ToList().ForEach(q =>
                    {
                        if (q.Contact.Id == user.Id) q.IsDeleted = false;
                    });
                }
                // If send with message -> add new message
                if (request.message is not null)
                {
                    conversation.Messages.Add(new Message
                    {
                        ContactId = user.Id,
                        Type = "text",
                        Content = request.message
                    });
                }
                _conversationRepository.Replace(updateFilter, conversation);
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
        async (ISender sender, string contactId, string message) =>
        {
            var query = new CreateConversationByContactId.Request(contactId, message);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}