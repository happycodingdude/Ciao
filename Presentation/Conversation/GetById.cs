namespace Presentation.Conversations;

public static class GetById
{
    public record Request(string id, int page) : IRequest<object>;

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
            RuleFor(c => c.id).ContactRelatedToConversation(_contactRepository, _conversationRepository);
        }
    }

    internal sealed class Handler : IRequestHandler<Request, object>
    {
        readonly IValidator<Request> _validator;
        readonly IConversationRepository _conversationRepository;

        public Handler(IValidator<Request> validator, IService<IConversationRepository> service)
        {
            _validator = validator;
            _conversationRepository = service.Get();
        }

        public async Task<object> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            return await _conversationRepository.GetById(request.id, new PagingParam(request.page));
        }
    }
}

public class GetByIdEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapGet("/{id}",
        async (ISender sender, string id, int page = AppConstants.DefaultPage) =>
        {
            var query = new GetById.Request(id, page);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}