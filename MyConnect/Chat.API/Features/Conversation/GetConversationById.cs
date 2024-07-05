using System.Diagnostics.CodeAnalysis;

public static class GetConversationById
{
    public class Query : IRequest<Conversation>
    {
        public Guid Id { get; set; }
    }

    internal sealed class Handler : IRequestHandler<Query, Conversation>
    {
        private readonly AppDbContext _dbContext;
        private readonly IMapper _mapper;

        public Handler(AppDbContext dbContext, IMapper mapper)
        {
            _dbContext = dbContext;
            _mapper = mapper;
        }

        public async Task<Conversation> Handle(Query request, CancellationToken cancellationToken)
        {
            return await _dbContext
                .Conversations
                .AsNoTracking()
                .Where(conversation => conversation.Id == request.Id)
                .FirstOrDefaultAsync(cancellationToken);
        }
    }
}

public class GetConversationByIdEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Conversation).MapGet("/{id}",
        async (HttpContext context, ISender sender, int page = 0, int limit = 0) =>
        {
            var userId = Guid.Parse(context.Session.GetString("UserId"));
            var query = new GetConversationsWithUnseenMesages.Query
            {
                ContactId = userId,
                Page = page,
                Limit = limit
            };
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization("AllUser");
    }
}