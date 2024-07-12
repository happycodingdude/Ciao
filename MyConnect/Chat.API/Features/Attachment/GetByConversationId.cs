namespace Chat.API.Features.Attachments;

public static class GetByConversationId
{
    public class Query : IRequest<IEnumerable<AttachmentGroupByCreatedTime>>
    {
        public Guid ConversationId { get; set; }
    }

    internal sealed class Handler : IRequestHandler<Query, IEnumerable<AttachmentGroupByCreatedTime>>
    {
        private readonly AppDbContext _dbContext;
        private readonly IMapper _mapper;

        public Handler(AppDbContext dbContext, IMapper mapper)
        {
            _dbContext = dbContext;
            _mapper = mapper;
        }

        public async Task<IEnumerable<AttachmentGroupByCreatedTime>> Handle(Query request, CancellationToken cancellationToken)
        {
            return await (
                from atta in _dbContext.Set<Attachment>().AsNoTracking().OrderByDescending(q => q.CreatedTime)
                join mess in _dbContext.Set<Message>().AsNoTracking() on atta.MessageId equals mess.Id
                where mess.ConversationId == request.ConversationId
                group atta by atta.CreatedTime.Value.Date into dateGrouping
                select new AttachmentGroupByCreatedTime
                {
                    Date = dateGrouping.Key.ToString("MM/dd/yyyy"),
                    Attachments = dateGrouping.ToList()
                }
            ).ToListAsync(cancellationToken);
        }
    }
}

public class GetByConversationIdEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Conversation).MapGet("/{id}/attachments",
        async (ISender sender, Guid id) =>
        {
            var query = new GetByConversationId.Query
            {
                ConversationId = id
            };
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization("Basic");
    }
}