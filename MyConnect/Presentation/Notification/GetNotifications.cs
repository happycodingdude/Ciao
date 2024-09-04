namespace Presentation.Notifications;

public static class GetByConversationId
{
    public record Request(int page, int limit) : IRequest<IEnumerable<Notification>>;

    internal sealed class Handler(IHttpContextAccessor httpContextAccessor, IUnitOfWork uow, IMapper mapper) : IRequestHandler<Request, IEnumerable<Notification>>
    {
        public async Task<IEnumerable<Notification>> Handle(Request request, CancellationToken cancellationToken)
        {
            var userId = httpContextAccessor.HttpContext.Session.GetString("UserId");
            var filter = Builders<Notification>.Filter.Where(q => q.ContactId == userId);
            var notifications = await uow.Notification.GetAllAsync(filter);
            if (!notifications.Any()) return Enumerable.Empty<Notification>();

            // var result = new List<NotificationTypeConstraint>(notifications.Count);
            // foreach (var notification in notifications)
            // {
            //     switch (notification.noti.SourceType)
            //     {
            //         case AppConstants.NotificationSourceType_FriendRequest:
            //             var constraintDto = mapper.Map<Notification, NotificationTypeConstraint>(notification.noti);
            //             var friendRequest = mapper.Map<Friend, NotificationSourceDataType_Friend>(notification.frnd);
            //             friendRequest.FriendStatus = notification.frnd.AcceptTime.HasValue == true
            //                 ? "friend"
            //                 : notification.frnd.FromContactId == request.contactId
            //                     ? "request_sent"
            //                     : "request_received";
            //             constraintDto.AddSourceData(friendRequest);
            //             result.Add(constraintDto);
            //             break;
            //         default:
            //             break;
            //     }
            // }

            return notifications;
        }
    }
}

public class GetByConversationIdEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Notification).MapGet("",
        async (HttpContext context, ISender sender, int page = 0, int limit = 0) =>
        {
            var query = new GetByConversationId.Request(page != 0 ? page : AppConstants.DefaultPage, limit != 0 ? limit : AppConstants.DefaultLimit);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}