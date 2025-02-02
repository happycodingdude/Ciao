namespace Presentation.Conversations;

public static class CreateGroupConversation
{
    public record Request(CreateGroupConversationReq model) : IRequest<string>;

    public class Validator : AbstractValidator<Request>
    {
        readonly IContactRepository _contactRepository;

        public Validator(IServiceProvider serviceProvider)
        {
            using (var scope = serviceProvider.CreateScope())
            {
                _contactRepository = scope.ServiceProvider.GetRequiredService<IContactRepository>();
            }
            RuleFor(c => c.model.Members).ShouldHaveValue().DependentRules(() =>
            {
                RuleFor(c => c.model.Members.Select(q => q.ContactId).ToList()).ShouldHaveContactId();
                RuleFor(c => c.model.Members.Select(q => q.ContactId).ToList()).ShouldNotHaveDuplicatedContactId();
                RuleFor(c => c).Must((item, cancellation) => MustContainAtLeastOneContact(item.model.Members.ToList()))
                    .WithMessage("Group conversation should contain at least 1 Member");
            });
        }

        bool MustContainAtLeastOneContact(List<Member> Members)
        {
            var userId = _contactRepository.GetUserId();
            return Members.Where(q => q.ContactId != userId).Count() >= 1;
        }
    }

    internal sealed class Handler : IRequestHandler<Request, string>
    {
        readonly IValidator<Request> _validator;
        readonly IFirebaseFunction _firebase;
        readonly IMapper _mapper;
        readonly IConversationRepository _conversationRepository;
        readonly IContactRepository _contactRepository;
        readonly ConversationCache _conversationCache;

        public Handler(IValidator<Request> validator,
            IFirebaseFunction firebase,
            IMapper mapper,
            IConversationRepository conversationRepository,
            IContactRepository contactRepository,
            ConversationCache conversationCache)
        {
            _validator = validator;
            _firebase = firebase;
            _mapper = mapper;
            _conversationRepository = conversationRepository;
            _contactRepository = contactRepository;
            _conversationCache = conversationCache;
        }

        public async Task<string> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var conversation = _mapper.Map<Conversation>(request.model);
            conversation.IsGroup = true;

            // Remove this user from input
            var user = await _contactRepository.GetInfoAsync();
            conversation.Members = conversation.Members.Where(q => q.ContactId != user.Id).ToList();

            // Assign contact info
            foreach (var Member in conversation.Members)
            {
                Member.IsModerator = false; // Only this user is moderator
                Member.IsDeleted = false; // Every Members will have this conversation active
                Member.IsNotifying = true; // Every Members will be notified
            }
            // Add this user
            conversation.Members.Add(new Member
            {
                IsModerator = true,
                IsDeleted = false,
                IsNotifying = true,
                ContactId = user.Id
            });

            // Create conversation
            _conversationRepository.Add(conversation);

            // Update cache
            var contactFilter = Builders<Contact>.Filter.Where(q => conversation.Members.Select(w => w.ContactId).Contains(q.Id));
            var contacts = await _contactRepository.GetAllAsync(contactFilter);
            var conversationToCache = _mapper.Map<ConversationCacheModel>(conversation);
            var memberToCache = _mapper.Map<List<MemberWithFriendRequestAndContactInfo>>(conversation.Members);
            foreach (var Member in memberToCache.Where(q => q.Contact.Id != user.Id))
            {
                Member.Contact.Name = contacts.SingleOrDefault(q => q.Id == Member.Contact.Id).Name;
                Member.Contact.Avatar = contacts.SingleOrDefault(q => q.Id == Member.Contact.Id).Avatar;
                Member.Contact.Bio = contacts.SingleOrDefault(q => q.Id == Member.Contact.Id).Bio;
                Member.Contact.IsOnline = contacts.SingleOrDefault(q => q.Id == Member.Contact.Id).IsOnline;
            }
            var thisUser = memberToCache.SingleOrDefault(q => q.Contact.Id == user.Id);
            thisUser.Contact.Name = user.Name;
            thisUser.Contact.Avatar = user.Avatar;
            thisUser.Contact.Bio = user.Bio;
            thisUser.Contact.IsOnline = true;
            await _conversationCache.AddConversation(user.Id, conversationToCache, memberToCache);

            // Push conversation
            var notify = _mapper.Map<ConversationToNotify>(conversation);
            _ = _firebase.Notify(
                "NewConversation",
                conversation.Members
                        .Where(q => q.ContactId != user.Id)
                        .Select(q => q.ContactId)
                    .ToArray(),
                notify
            );

            return conversation.Id;
        }
    }
}

public class CreateGroupConversationEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapPost("",
        async (ISender sender, CreateGroupConversationReq model) =>
        {
            var query = new CreateGroupConversation.Request(model);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}