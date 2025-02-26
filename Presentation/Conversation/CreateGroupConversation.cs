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
                RuleFor(c => c.model.Members.ToList()).ShouldHaveContactId();
                RuleFor(c => c.model.Members.ToList()).ShouldNotHaveDuplicatedContactId();
                RuleFor(c => c).Must((item, cancellation) => MustContainAtLeastOneContact(item.model.Members))
                    .WithMessage("Group conversation should contain at least 1 Member");
            });
        }

        bool MustContainAtLeastOneContact(string[] Members)
        {
            var userId = _contactRepository.GetUserId();
            return Members.Where(q => q != userId).Count() >= 1;
        }
    }

    internal sealed class Handler : IRequestHandler<Request, string>
    {
        readonly IValidator<Request> _validator;
        readonly IMapper _mapper;
        readonly IContactRepository _contactRepository;
        readonly IKafkaProducer _kafkaProducer;

        public Handler(IValidator<Request> validator, IMapper mapper, IContactRepository contactRepository, IKafkaProducer kafkaProducer)
        {
            _validator = validator;
            _mapper = mapper;
            _contactRepository = contactRepository;
            _kafkaProducer = kafkaProducer;
        }

        public async Task<string> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var userId = _contactRepository.GetUserId();
            // Remove duplicate, just keep one item for this user
            var conversation = _mapper.Map<Conversation>(request.model);
            conversation.IsGroup = true;
            var members = conversation.Members.Where(q => q.ContactId != userId).ToList();
            members.Add(new Member
            {
                ContactId = userId
            });

            await _kafkaProducer.ProduceAsync(Topic.NewGroupConversation, new NewGroupConversationModel
            {
                UserId = _contactRepository.GetUserId(),
                Conversation = _mapper.Map<NewGroupConversationModel_Conversation>(conversation),
                Members = _mapper.Map<NewGroupConversationModel_Member[]>(members.ToArray())
            });

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