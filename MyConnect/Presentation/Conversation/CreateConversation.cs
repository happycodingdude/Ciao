namespace Presentation.Conversations;

public static class CreateConversation
{
    public record Request(CreateConversationRequest model) : IRequest<Unit>;

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
            RuleFor(c => c.model.Participants).ShouldHaveValue().DependentRules(() =>
            {
                RuleFor(c => c.model.Participants.Select(q => q.ContactId).ToList()).ShouldHaveContactId();
                RuleFor(c => c.model.Participants.Select(q => q.ContactId).ToList()).ShouldNotHaveDuplicatedContactId();
                When(c => c.model.IsGroup, () =>
                {
                    RuleFor(c => c.model.Participants.Count).GreaterThan(1).WithMessage("Group conversation should contain at least 1 participant");
                });
                When(c => !c.model.IsGroup, () =>
                {
                    RuleFor(c => c).MustAsync((item, cancellation) => MustContainOnlyOneContact(item.model.Participants.ToList()))
                        .WithMessage("Direct conversation should only contain 1 participant")
                        .DependentRules(() =>
                        {
                            RuleFor(c => c).MustAsync((item, cancellation) => OnlyOneDirectConversation(item.model.Participants.ToList()))
                                .WithMessage("Direct conversation was created");
                        });
                });
            });
            RuleFor(c => c.model.Title).NotEmpty().When(q => q.model.IsGroup).WithMessage("Title should not be empty");
        }

        async Task<bool> MustContainOnlyOneContact(List<CreateConversation_Participant> participants)
        {
            var user = await _contactRepository.GetInfoAsync();
            return participants.Count == 1 && participants.Any(q => q.ContactId != user.Id);
        }

        async Task<bool> OnlyOneDirectConversation(List<CreateConversation_Participant> participants)
        {
            var user = await _contactRepository.GetInfoAsync();
            var contactId = participants.FirstOrDefault(q => q.ContactId != user.Id).ContactId;

            var filter = Builders<Conversation>.Filter.And(
                Builders<Conversation>.Filter.ElemMatch(q => q.Participants, w => w.Contact.Id == user.Id),
                Builders<Conversation>.Filter.ElemMatch(q => q.Participants, w => w.Contact.Id == contactId),
                Builders<Conversation>.Filter.Eq(q => q.IsGroup, false)
            );
            var conversation = await _conversationRepository.GetAllAsync(filter);

            return !conversation.Any();
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        readonly IValidator<Request> _validator;
        readonly IHttpContextAccessor _httpContextAccessor;
        readonly INotificationMethod _notificationMethod;
        readonly IMapper _mapper;
        readonly IConversationRepository _conversationRepository;
        readonly IContactRepository _contactRepository;

        public Handler(IValidator<Request> validator,
            IHttpContextAccessor httpContextAccessor,
            INotificationMethod notificationMethod,
            IMapper mapper,
            IService<IConversationRepository> conversationService,
            IService<IContactRepository> contactService)
        {
            _validator = validator;
            _httpContextAccessor = httpContextAccessor;
            _notificationMethod = notificationMethod;
            _mapper = mapper;
            _conversationRepository = conversationService.Get();
            _contactRepository = contactService.Get();
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var contactFilter = Builders<Contact>.Filter.Where(q => request.model.Participants.Select(w => w.ContactId).Contains(q.Id));
            var contacts = await _contactRepository.GetAllAsync(contactFilter);

            // Remove this user from input
            var user = await _contactRepository.GetInfoAsync();
            request.model.Participants = request.model.Participants.Where(q => q.ContactId != user.Id).ToList();
            // Assign contact info
            var conversation = _mapper.Map<CreateConversationRequest, Conversation>(request.model);
            foreach (var participant in conversation.Participants)
            {
                participant.IsModerator = false; // Only this user is moderator
                participant.IsDeleted = false; // Every participants will have this conversation active
                participant.IsNotifying = true; // Every participants will be notified
                participant.Contact.Name = contacts.SingleOrDefault(q => q.Id == participant.Contact.Id)?.Name;
                participant.Contact.Avatar = contacts.SingleOrDefault(q => q.Id == participant.Contact.Id)?.Avatar;
            }
            // Add this user
            conversation.Participants.Add(new Participant
            {
                IsModerator = true,
                IsDeleted = false,
                IsNotifying = true,
                Contact = new Message_Contact
                {
                    Id = user.Id,
                    Name = user.Name,
                    Avatar = user.Avatar
                }
            });
            _conversationRepository.Add(conversation);

            // var userId = _httpContextAccessor.HttpContext.Items["UserId"]?.ToString();

            // await _notificationMethod.Notify(
            //     "NewConversation",
            //     request.model.Participants
            //         .Where(q => q.Contact.Id != userId)
            //         .Select(q => q.Contact.Id)
            //         .ToArray(),
            //     request.model
            // );

            return Unit.Value;
        }
    }
}

public class CreateConversationEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Conversation).MapPost("",
        async (ISender sender, CreateConversationRequest model) =>
        {
            var query = new CreateConversation.Request(model);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}