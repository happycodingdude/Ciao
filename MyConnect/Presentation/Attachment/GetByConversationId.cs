// namespace Presentation.Attachments;

// public static class GetByConversationId
// {
//     public record Request(string conversationId) : IRequest<IEnumerable<AttachmentGroupByCreatedTime>>;

//     internal sealed class Handler : IRequestHandler<Request, IEnumerable<AttachmentGroupByCreatedTime>>
//     {
//         private readonly IMessageRepository _messageRepository;

//         public Handler(IService service)
//         {
//             _messageRepository = service.Get<IMessageRepository>();
//         }

//         public async Task<IEnumerable<AttachmentGroupByCreatedTime>> Handle(Request request, CancellationToken cancellationToken)
//         {
//             var filter = Builders<Message>.Filter.Where(q => q.ConversationId == request.conversationId);
//             var data = await _messageRepository.GetItemAsync(filter);
//             return (
//                 from atta in data.Attachments.OrderByDescending(q => q.CreatedTime)
//                 group atta by atta.CreatedTime.Date into dateGrouping
//                 select new AttachmentGroupByCreatedTime
//                 {
//                     Date = dateGrouping.Key.ToString("MM/dd/yyyy"),
//                     Attachments = dateGrouping.ToList()
//                 }
//             );
//         }
//     }
// }

// public class GetByConversationIdEndpoint : ICarterModule
// {
//     public void AddRoutes(IEndpointRouteBuilder app)
//     {
//         app.MapGroup(AppConstants.ApiRoute_Conversation).MapGet("/{conversationId}/attachments",
//         async (ISender sender, string conversationId) =>
//         {
//             var query = new GetByConversationId.Request(conversationId);
//             var result = await sender.Send(query);
//             return Results.Ok(result);
//         }).RequireAuthorization("Basic");
//     }
// }