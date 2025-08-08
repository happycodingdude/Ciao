namespace Presentation.Members;

public static class AddMember
{
    public record Request(string conversationId, string[] members) : IRequest<Unit>;

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
                RuleFor(c => c.members).ShouldHaveValue().DependentRules(() =>
                {
                    RuleFor(c => c.members.Select(q => q).ToList()).ShouldHaveContactId();
                    RuleFor(c => c.members.Select(q => q).ToList()).ShouldNotHaveDuplicatedContactId();
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
        readonly IContactRepository _contactRepository;
        readonly IKafkaProducer _kafkaProducer;

        public Handler(IValidator<Request> validator,
            IContactRepository contactRepository,
            IKafkaProducer kafkaProducer)
        {
            _validator = validator;
            _contactRepository = contactRepository;
            _kafkaProducer = kafkaProducer;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            await _kafkaProducer.ProduceAsync(Topic.NewMember, new NewMemberModel
            {
                UserId = _contactRepository.GetUserId(),
                ConversationId = request.conversationId,
                Members = request.members
            });

            return Unit.Value;
        }
    }
}

public class AddMemberEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapPost("/{conversationId}/members",
        async (ISender sender, string conversationId, string[] members) =>
        {
            var query = new AddMember.Request(conversationId, members);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization();
    }
}