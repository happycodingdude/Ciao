namespace Presentation.Conversations;

public static class UpdateConversation
{
    public record Request(string id, Conversation model) : IRequest<Unit>;

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
            RuleFor(c => c.id).ContactRelatedToConversation(_contactRepository, _conversationRepository).DependentRules(() =>
            {
                RuleFor(c => c.model.Title).NotEmpty().When(q => q.model.IsGroup).WithMessage("Title should not be empty");
            });
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        readonly IValidator<Request> _validator;
        readonly IConversationRepository _conversationRepository;

        public Handler(IValidator<Request> validator, IService<IConversationRepository> service)
        {
            _validator = validator;
            _conversationRepository = service.Get();
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var filter = MongoQuery<Conversation>.IdFilter(request.id);
            var updates = Builders<Conversation>.Update
                .Set(q => q.Title, request.model.Title)
                .Set(q => q.Avatar, request.model.Avatar);
            _conversationRepository.Update(filter, updates);

            return Unit.Value;
        }
    }
}

public class UpdateConversationEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Conversation).MapPut("/{id}",
        async (ISender sender, string id, Conversation model) =>
        {
            var query = new UpdateConversation.Request(id, model);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}