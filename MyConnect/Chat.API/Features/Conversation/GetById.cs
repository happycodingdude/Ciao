public static class GetById
{
    public class Query : IRequest<ConversationDto>
    {
        public Guid Id { get; set; }
    }

    internal sealed class Handler : IRequestHandler<Query, ConversationDto>
    {
        private readonly IConversationService _service;

        public Handler(IConversationService service)
        {
            _service = service;
        }

        public async Task<ConversationDto> Handle(Query request, CancellationToken cancellationToken)
        {
            return await _service.GetByIdAsync(request.Id);
        }
    }
}

public class GetByIdEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Conversation).MapGet("/{id}",
        async (ISender sender, Guid id) =>
        {
            var query = new GetById.Query
            {
                Id = id
            };
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization("Basic");
    }
}