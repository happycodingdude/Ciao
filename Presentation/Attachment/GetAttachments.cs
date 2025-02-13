namespace Presentation.Attachments;

public static class GetAttachments
{
    public record Request(string conversationId) : IRequest<IEnumerable<AttachmentGroupByCreatedTime>>;

    internal sealed class Handler : IRequestHandler<Request, IEnumerable<AttachmentGroupByCreatedTime>>
    {
        private readonly IConversationRepository _conversationRepository;

        public Handler(IService<IConversationRepository> service)
        {
            _conversationRepository = service.Get();
        }

        public async Task<IEnumerable<AttachmentGroupByCreatedTime>> Handle(Request request, CancellationToken cancellationToken)
        {
            var filter = MongoQuery<Conversation>.IdFilter(request.conversationId);
            var conversation = await _conversationRepository.GetItemAsync(filter);

            return (
                from atta in conversation.Messages.SelectMany(q => q.Attachments).OrderByDescending(q => q.CreatedTime)
                group atta by atta.CreatedTime.Date into dateGrouping
                select new AttachmentGroupByCreatedTime
                {
                    Date = dateGrouping.Key.ToString("MM/dd/yyyy"),
                    Attachments = dateGrouping.ToList()
                }
            );
        }
    }
}

public class GetAttachmentsEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapGet("/{conversationId}/attachments",
        async (ISender sender, string conversationId) =>
        {
            var query = new GetAttachments.Request(conversationId);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization("Basic");
    }
}