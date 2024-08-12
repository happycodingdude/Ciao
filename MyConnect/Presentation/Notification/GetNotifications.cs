namespace Presentation.Notifications;

public static class GetByConversationId
{
    public record Request(Guid contactId, int page, int limit) : IRequest<IEnumerable<NotificationTypeConstraint>>;

    internal sealed class Handler(IUnitOfWork uow, IMapper mapper) : IRequestHandler<Request, IEnumerable<NotificationTypeConstraint>>
    {
        public async Task<IEnumerable<NotificationTypeConstraint>> Handle(Request request, CancellationToken cancellationToken)
        {
            var notifications = await (
                from noti in uow.Notification.DbSet
                    .AsNoTracking()
                    .Where(q => q.ContactId == request.contactId)
                    .OrderByDescending(q => q.CreatedTime)
                    .Skip(request.limit * (request.page - 1))
                    .Take(request.limit)
                from frnd in uow.Friend.DbSet
                    .Where(f => f.Id == noti.SourceId)
                    .DefaultIfEmpty()
                select new
                {
                    noti,
                    frnd
                }
            )
            .ToListAsync(cancellationToken);

            if (!notifications.Any()) return Enumerable.Empty<NotificationTypeConstraint>();

            var result = new List<NotificationTypeConstraint>(notifications.Count);
            foreach (var notification in notifications)
            {
                switch (notification.noti.SourceType)
                {
                    case AppConstants.NotificationSourceType_FriendRequest:
                        var constraintDto = mapper.Map<Notification, NotificationTypeConstraint>(notification.noti);
                        var friendRequest = mapper.Map<Friend, NotificationSourceDataType_Friend>(notification.frnd);
                        friendRequest.FriendStatus = notification.frnd.AcceptTime.HasValue == true
                            ? "friend"
                            : notification.frnd.FromContactId == request.contactId
                                ? "request_sent"
                                : "request_received";
                        constraintDto.AddSourceData(friendRequest);
                        result.Add(constraintDto);
                        break;
                    default:
                        break;
                }
            }

            return result;
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
            var userId = Guid.Parse(context.Session.GetString("UserId"));
            var query = new GetByConversationId.Request(userId, page != 0 ? page : AppConstants.DefaultPage, limit != 0 ? limit : AppConstants.DefaultLimit);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}