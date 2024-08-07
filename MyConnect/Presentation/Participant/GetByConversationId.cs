namespace Presentation.Participants;

public static class GetByConversationId
{
    public class Query : IRequest<IEnumerable<ParticipantWithContact>>
    {
        public Guid ConversationId { get; set; }
    }

    internal sealed class Handler : IRequestHandler<Query, IEnumerable<ParticipantWithContact>>
    {
        private readonly AppDbContext _dbContext;
        private readonly IMapper _mapper;

        public Handler(AppDbContext dbContext, IMapper mapper)
        {
            _dbContext = dbContext;
            _mapper = mapper;
        }

        public async Task<IEnumerable<ParticipantWithContact>> Handle(Query request, CancellationToken cancellationToken)
        {
            return await (
                from part in _dbContext.Set<Participant>().AsNoTracking()
                join cust in _dbContext.Set<Contact>().AsNoTracking() on part.ContactId equals cust.Id
                where part.ConversationId == request.ConversationId
                select new ParticipantWithContact
                {
                    Id = part.Id,
                    IsDeleted = part.IsDeleted,
                    IsModerator = part.IsModerator,
                    IsNotifying = part.IsNotifying,
                    ContactId = cust.Id,
                    Contact = _mapper.Map<Contact, ParticipantWithContact_Contact>(cust)
                }
            ).ToListAsync(cancellationToken);
        }
    }
}

public class GetByConversationIdEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Conversation).MapGet("/{id}/participants",
        async (ISender sender, Guid id) =>
        {
            var query = new GetByConversationId.Query
            {
                ConversationId = id
            };
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}