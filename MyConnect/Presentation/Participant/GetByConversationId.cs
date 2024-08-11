namespace Presentation.Participants;

public static class GetByConversationId
{
    public class Query : IRequest<IEnumerable<ParticipantWithContact>>
    {
        public Guid ConversationId { get; set; }
    }

    internal sealed class Handler : IRequestHandler<Query, IEnumerable<ParticipantWithContact>>
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public Handler(IMapper mapper, IUnitOfWork uow)
        {
            _mapper = mapper;
            _uow = uow;
        }

        public async Task<IEnumerable<ParticipantWithContact>> Handle(Query request, CancellationToken cancellationToken)
        {
            return await (
                from part in _uow.Participant.DbSet
                join cust in _uow.Contact.DbSet on part.ContactId equals cust.Id
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