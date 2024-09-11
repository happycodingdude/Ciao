
namespace Presentation.Conversations;

public static class UpdateConversation
{
    public record Request(string id, Conversation model) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        public Validator()
        {
            // RuleFor(c => c.patch.Operations.Where(q => q.path.ToLower() == nameof(ConversationDto.Title).ToLower()).Select(q => q.value.ToString()))
            //     .Must(q => q.All(w => !string.IsNullOrEmpty(w)))
            //     .WithMessage("Title should not be empty");
            RuleFor(c => c.model.Title).NotEmpty().When(q => q.model.IsGroup).WithMessage("Title should not be empty");
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        private readonly IValidator<Request> validator;
        private readonly IUnitOfWork uow;
        private readonly IConversationRepository conversationRepository;

        public Handler(IValidator<Request> validator, IServiceScopeFactory scopeFactory, IUnitOfWork uow)
        {
            this.validator = validator;
            this.uow = uow;
            using (var scope = scopeFactory.CreateScope())
            {
                conversationRepository = scope.ServiceProvider.GetService<IConversationRepository>();
            }
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var filter = MongoQuery.IdFilter<Conversation>(request.id);
            var updates = Builders<Conversation>.Update
                .Set(q => q.Title, request.model.Title)
                .Set(q => q.Avatar, request.model.Avatar);
            conversationRepository.Update(filter, updates);
            await uow.SaveAsync();

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