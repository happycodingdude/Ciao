namespace Presentation.Attachments;

public static class GetByConversationId
{
    public record Request(Guid conversationId) : IRequest<IEnumerable<AttachmentGroupByCreatedTime>>;

    internal sealed class Handler(IUnitOfWork uow) : IRequestHandler<Request, IEnumerable<AttachmentGroupByCreatedTime>>
    {
        public async Task<IEnumerable<AttachmentGroupByCreatedTime>> Handle(Request request, CancellationToken cancellationToken)
        {
            return await (
                from atta in uow.Attachment.DbSet.OrderByDescending(q => q.CreatedTime)
                join mess in uow.Message.DbSet on atta.MessageId equals mess.Id
                where mess.ConversationId == request.conversationId
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
            var query = new GetByConversationId.Request(id);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization("Basic");
    }
}