namespace Presentation.Friends;

public static class CreateConversationByContactId
{
    public record Request(string contactId, string message) : IRequest<string>;

    internal sealed class Handler : IRequestHandler<Request, string>
    {
        readonly IConversationRepository _conversationRepository;
        readonly IContactRepository _contactRepository;
        readonly IMapper _mapper;
        readonly INotificationMethod _notificationMethod;

        public Handler(IService<IConversationRepository> conversationService,
            IService<IContactRepository> contactService,
            IMapper mapper,
            INotificationMethod notificationMethod)
        {
            _conversationRepository = conversationService.Get();
            _contactRepository = contactService.Get();
            _mapper = mapper;
            _notificationMethod = notificationMethod;
        }

        public async Task<string> Handle(Request request, CancellationToken cancellationToken)
        {
            // var conversationId = "";
            var user = await _contactRepository.GetInfoAsync();
            var message = new Message
            {
                ContactId = user.Id,
                Type = "text",
                Content = request.message
            };
            var filter = Builders<Conversation>.Filter.And(
                Builders<Conversation>.Filter.ElemMatch(q => q.Participants, w => w.Contact.Id == user.Id),
                Builders<Conversation>.Filter.ElemMatch(q => q.Participants, w => w.Contact.Id == request.contactId),
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
                    Contact = new Participant_Contact
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
                    Contact = new Participant_Contact
                    {
                        Id = user.Id,
                        Name = user.Name,
                        Avatar = user.Avatar,
                        IsOnline = true
                    }
                });
                // If send with message -> add new message
                if (!string.IsNullOrEmpty(request.message))
                    newConversation.Messages.Add(message);

                _conversationRepository.Add(newConversation);

                conversation = newConversation;
                // conversationId = newConversation.Id;

                // Push conversation
                // var notify = _mapper.Map<ConversationToNotify>(newConversation);
                // _ = _notificationMethod.Notify(
                //     "NewConversation",
                //     newConversation.Participants
                //         .Where(q => q.Contact.Id != user.Id)
                //         .Select(q => q.Contact.Id)
                //     .ToArray(),
                //     notify
                // );
            }
            // If conversation exists -> update field IsDeleted if true then return
            else
            {
                var updateFilter = MongoQuery<Conversation>.IdFilter(conversation.Id);
                var currentUser = conversation.Participants.SingleOrDefault(q => q.Contact.Id == user.Id);
                if (currentUser.IsDeleted)
                {
                    conversation.Participants.ToList().ForEach(q =>
                    {
                        if (q.Contact.Id == user.Id) q.IsDeleted = false;
                    });
                }
                // If send with message -> add new message
                if (!string.IsNullOrEmpty(request.message))
                    conversation.Messages.Add(message);

                _conversationRepository.Replace(updateFilter, conversation);
                // conversationId = conversation.Id;

                // Push message            
                // var notify = _mapper.Map<Message, MessageToNotify>(message);
                // notify.Conversation = new MessageToNotify_Conversation
                // {
                //     Id = conversationId
                // };
                // notify.Contact = _mapper.Map<MessageToNotify_Contact>(user);
                // _ = _notificationMethod.Notify(
                //     "NewMessage",
                //     conversation.Participants
                //         .Where(q => q.Contact.Id != user.Id)
                //         .Select(q => q.Contact.Id)
                //     .ToArray(),
                //     notify
                // );
            }

            // Push message            
            var notify = _mapper.Map<MessageToNotify>(message);
            notify.Conversation = _mapper.Map<ConversationToNotify>(conversation);
            // notify.Conversation.LastMessage = message.Content;
            // notify.Conversation.LastMessageContact = user.Id;
            notify.Contact = _mapper.Map<MessageToNotify_Contact>(user);
            _ = _notificationMethod.Notify(
                "NewMessage",
                conversation.Participants
                    .Where(q => q.Contact.Id != user.Id)
                    .Select(q => q.Contact.Id)
                .ToArray(),
                notify
            );

            return conversation.Id;
        }
    }
}

public class CreateConversationByContactIdEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Contact).MapPost("/{contactId}/conversations",
        async (ISender sender, string contactId, string message) =>
        {
            var query = new CreateConversationByContactId.Request(contactId, message);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}