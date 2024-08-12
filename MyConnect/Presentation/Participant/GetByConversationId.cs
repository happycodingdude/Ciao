namespace Presentation.Participants;

public static class GetByConversationId
{
    public record Request(Guid conversationId) : IRequest<IEnumerable<ParticipantWithContact>>;

    internal sealed class Handler(IMapper mapper, IUnitOfWork uow) : IRequestHandler<Request, IEnumerable<ParticipantWithContact>>
    {
        public async Task<IEnumerable<ParticipantWithContact>> Handle(Request request, CancellationToken cancellationToken)
        {
            return await (
                from part in uow.Participant.DbSet
                join cust in uow.Contact.DbSet on part.ContactId equals cust.Id
                where part.ConversationId == request.conversationId
                select new ParticipantWithContact
                {
                    Id = part.Id,
                    IsDeleted = part.IsDeleted,
                    IsModerator = part.IsModerator,
                    IsNotifying = part.IsNotifying,
                    ContactId = cust.Id,
                    Contact = mapper.Map<Contact, ParticipantWithContact_Contact>(cust)
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
            var query = new GetByConversationId.Request(id);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}