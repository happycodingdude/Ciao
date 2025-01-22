namespace Presentation.Participants;

public static class CreateParticipant
{
    public record Request(string conversationId, List<CreateGroupConversation_Participant> model) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        readonly IConversationRepository _conversationRepository;

        public Validator(IServiceProvider serviceProvider)
        {
            using (var scope = serviceProvider.CreateScope())
            {
                _conversationRepository = scope.ServiceProvider.GetRequiredService<IConversationRepository>();
            }
            RuleFor(c => c.conversationId).NotEmpty().WithMessage("ConversationId should not be empty");
            RuleFor(c => c.model).ShouldHaveValue().DependentRules(() =>
            {
                RuleFor(c => c.model.Select(q => q.ContactId).ToList()).ShouldHaveContactId();
                RuleFor(c => c.model.Select(q => q.ContactId).ToList()).ShouldNotHaveDuplicatedContactId();
                RuleFor(c => c.conversationId).MustAsync((item, cancellation) => MustBeGroupConversation(item))
                    .WithMessage("Must be group conversation");
            });
        }

        async Task<bool> MustBeGroupConversation(string conversationId)
        {
            var conversation = await _conversationRepository.GetItemAsync(MongoQuery<Conversation>.IdFilter(conversationId));
            return conversation.IsGroup;
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        readonly IValidator<Request> _validator;
        readonly IMapper _mapper;
        readonly IConversationRepository _conversationRepository;
        readonly IContactRepository _contactRepository;
        readonly INotificationMethod _notificationMethod;
        readonly ICaching _caching;
        readonly IFriendRepository _friendRepository;

        public Handler(IValidator<Request> validator,
            IMapper mapper,
            IService<IConversationRepository> conversationService,
            IService<IContactRepository> contactService,
            INotificationMethod notificationMethod,
            ICaching caching,
            IFriendRepository friendRepository)
        {
            _validator = validator;
            _mapper = mapper;
            _conversationRepository = conversationService.Get();
            _contactRepository = contactService.Get();
            _notificationMethod = notificationMethod;
            _caching = caching;
            _friendRepository = friendRepository;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            // Get current participants of conversation, then filter new item to add
            var filter = MongoQuery<Conversation>.IdFilter(request.conversationId);
            var conversation = await _conversationRepository.GetItemAsync(filter);

            // Filter new participants
            var filterNewItemToAdd = request.model.Select(q => q.ContactId).ToList().Except(conversation.Participants.Select(q => q.Contact.Id).ToList());
            // Compare with input -> only get new item
            var filteredParticipants = request.model.Where(q => filterNewItemToAdd.Contains(q.ContactId)).ToList();
            // Return if no new partipants
            if (!filteredParticipants.Any()) return Unit.Value;

            // Re-assign new participants
            var contactFilter = Builders<Contact>.Filter.Where(q => request.model.Select(w => w.ContactId).Contains(q.Id));
            var contacts = await _contactRepository.GetAllAsync(contactFilter);
            var convertedParticipants = _mapper.Map<List<CreateGroupConversation_Participant>, List<Participant>>(filteredParticipants);
            foreach (var participant in convertedParticipants)
            {
                participant.IsModerator = false; // Only this user is moderator
                participant.IsDeleted = false; // Every participants will have this conversation active
                participant.IsNotifying = true; // Every participants will be notified
                participant.Contact.Name = contacts.SingleOrDefault(q => q.Id == participant.Contact.Id)?.Name;
                participant.Contact.Avatar = contacts.SingleOrDefault(q => q.Id == participant.Contact.Id)?.Avatar;
            }
            // Concatenate to existed items
            var participantsToUpdate = conversation.Participants.Concat(convertedParticipants);
            var updates = Builders<Conversation>.Update
                .Set(q => q.Participants, participantsToUpdate);
            _conversationRepository.UpdateNoTrackingTime(filter, updates);

            // Update cache
            var friendItems = await _friendRepository.GetFriendItems(convertedParticipants.Select(q => q.Contact.Id).ToList());
            var convertParticipantToUpdateCache = _mapper.Map<List<ParticipantWithFriendRequest>>(convertedParticipants);
            for (var i = 0; i < convertParticipantToUpdateCache.Count; i++)
            {
                convertParticipantToUpdateCache[i].FriendId = friendItems[i].Item1;
                convertParticipantToUpdateCache[i].FriendStatus = "friend";
            }
            await _caching.AddNewParticipant(_contactRepository.GetUserId(), conversation.Id, convertParticipantToUpdateCache);

            // Push conversation
            var notify = _mapper.Map<ConversationToNotify>(conversation);
            var lastMessage = conversation.Messages.OrderByDescending(q => q.CreatedTime).FirstOrDefault();
            if (lastMessage is not null)
            {
                notify.LastMessage = lastMessage.Content;
                notify.LastMessageContact = lastMessage.ContactId;
            }
            _ = _notificationMethod.Notify(
                "NewConversation",
                convertedParticipants.Select(q => q.Contact.Id).ToArray(),
                notify
            );

            return Unit.Value;
        }
    }
}

public class CreateParticipantEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapPost("/{conversationId}/participants",
        async (ISender sender, string conversationId, List<CreateGroupConversation_Participant> model, bool includeNotify = false) =>
        {
            var query = new CreateParticipant.Request(conversationId, model);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization();
    }
}