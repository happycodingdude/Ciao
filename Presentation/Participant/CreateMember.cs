namespace Presentation.Members;

public static class CreateMember
{
    public record Request(string conversationId, List<string> model) : IRequest<Unit>;

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
            RuleFor(c => c.conversationId).ContactRelatedToConversation(_contactRepository, _conversationRepository).DependentRules(() =>
            {
                RuleFor(c => c.model).ShouldHaveValue().DependentRules(() =>
                {
                    RuleFor(c => c.model.Select(q => q).ToList()).ShouldHaveContactId();
                    RuleFor(c => c.model.Select(q => q).ToList()).ShouldNotHaveDuplicatedContactId();
                    RuleFor(c => c.conversationId).MustAsync((item, cancellation) => MustBeGroupConversation(item))
                        .WithMessage("Must be group conversation");
                });
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
        readonly IFirebaseFunction _firebase;
        readonly IConversationRepository _conversationRepository;
        readonly IContactRepository _contactRepository;
        readonly IFriendRepository _friendRepository;
        readonly ConversationCache _conversationCache;
        readonly MemberCache _memberCache;
        readonly UserCache _userCache;
        readonly INotificationProcessor _notificationProcessor;
        readonly IHubContext<SignalHub> _hubContext;
        readonly IKafkaProducer _kafkaProducer;

        public Handler(IValidator<Request> validator,
            IMapper mapper,
            IFirebaseFunction firebase,
            IConversationRepository conversationRepository,
            IContactRepository contactRepository,
            IFriendRepository friendRepository,
            ConversationCache conversationCache,
            MemberCache memberCache,
            UserCache userCache,
            INotificationProcessor notificationProcessor,
            IHubContext<SignalHub> hubContext,
            IKafkaProducer kafkaProducer)
        {
            _validator = validator;
            _mapper = mapper;
            _firebase = firebase;
            _conversationRepository = conversationRepository;
            _contactRepository = contactRepository;
            _friendRepository = friendRepository;
            _conversationCache = conversationCache;
            _memberCache = memberCache;
            _userCache = userCache;
            _notificationProcessor = notificationProcessor;
            _hubContext = hubContext;
            _kafkaProducer = kafkaProducer;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            // Get current Members of conversation, then filter new item to add
            var filter = MongoQuery<Conversation>.IdFilter(request.conversationId);
            var conversation = await _conversationRepository.GetItemAsync(filter);

            // Filter new Members
            var filterNewItemToAdd = request.model.Select(q => q).ToList()
                .Except(conversation.Members.Select(q => q.ContactId).ToList())
                .ToList();
            // Return if no new partipants
            if (!filterNewItemToAdd.Any()) return Unit.Value;

            // Create list new Members
            var membersToAdd = new List<Member>(filterNewItemToAdd.Count);
            filterNewItemToAdd.ToList().ForEach(q => membersToAdd.Add(
                new Member
                {
                    IsModerator = false, // Only this user is moderator
                    IsDeleted = false, // Every Members will have this conversation active
                    IsNotifying = true,
                    ContactId = q
                }));
            // Concatenate to existed partipants
            var membersToUpdate = conversation.Members.Concat(membersToAdd);

            // Update to db
            var updates = Builders<Conversation>.Update.Set(q => q.Members, membersToUpdate);
            // _conversationRepository.UpdateNoTrackingTime(filter, updates);

            // Update cache
            var contactFilter = Builders<Contact>.Filter.Where(q => filterNewItemToAdd.Contains(q.Id));
            var contacts = await _contactRepository.GetAllAsync(contactFilter);
            var memberToCache = _mapper.Map<List<MemberWithContactInfo>>(membersToAdd);
            foreach (var member in memberToCache)
            {
                member.Contact.Name = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).Name;
                member.Contact.Avatar = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).Avatar;
                member.Contact.Bio = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).Bio;
                member.Contact.IsOnline = contacts.SingleOrDefault(q => q.Id == member.Contact.Id).IsOnline;
            }
            // var friendItems = await _friendRepository.GetFriendItems(MembersToAdd.Select(q => q.ContactId).ToList());
            // for (var i = 0; i < MemberToCache.Count; i++)
            // {
            //     MemberToCache[i].Contact.Name = contacts.SingleOrDefault(q => q.Id == MemberToCache[i].Contact.Id).Name;
            //     MemberToCache[i].Contact.Avatar = contacts.SingleOrDefault(q => q.Id == MemberToCache[i].Contact.Id).Avatar;
            //     MemberToCache[i].Contact.Bio = contacts.SingleOrDefault(q => q.Id == MemberToCache[i].Contact.Id).Bio;
            //     MemberToCache[i].Contact.IsOnline = contacts.SingleOrDefault(q => q.Id == MemberToCache[i].Contact.Id).IsOnline;
            //     MemberToCache[i].FriendId = friendItems[i].Item1;
            //     MemberToCache[i].FriendStatus = "friend";
            // }

            // await _memberCache.AddMembers(conversation.Id, memberToCache);

            // Push notification
            var notify = _mapper.Map<ConversationToNotify>(conversation);
            var lastMessage = conversation.Messages.OrderByDescending(q => q.CreatedTime).FirstOrDefault();
            if (lastMessage is not null)
            {
                notify.LastMessage = lastMessage.Content;
                notify.LastMessageContact = lastMessage.ContactId;
            }
            await _kafkaProducer.ProduceAsync(Topic.NotifyNewConversation, new NotifyNewConversationModel
            {
                UserId = _contactRepository.GetUserId(),
                ConversationId = request.conversationId,
                UserIds = memberToCache.Select(q => q.Contact.Id).ToArray(),
                Conversation = notify
            });

            return Unit.Value;
        }
    }
}

public class CreateMemberEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapPost("/{conversationId}/members",
        async (ISender sender, string conversationId, List<string> model, bool includeNotify = false) =>
        {
            var query = new CreateMember.Request(conversationId, model);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization();
    }
}