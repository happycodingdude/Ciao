namespace Chat.API.Features.Notifications;

public static class GetByConversationId
{
    public class Query : IRequest<IEnumerable<NotificationTypeConstraint>>
    {
        public Guid ContactId { get; set; }
        public int Page { get; set; }
        public int Limit { get; set; }
    }

    internal sealed class Handler : IRequestHandler<Query, IEnumerable<NotificationTypeConstraint>>
    {
        private readonly AppDbContext _dbContext;
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public Handler(AppDbContext dbContext, IUnitOfWork uow, IMapper mapper)
        {
            _dbContext = dbContext;
            _uow = uow;
            _mapper = mapper;
        }

        public async Task<IEnumerable<NotificationTypeConstraint>> Handle(Query request, CancellationToken cancellationToken)
        {
            request.Page = request.Page != 0 ? request.Page : AppConstants.DefaultPage;
            request.Limit = request.Limit != 0 ? request.Limit : AppConstants.DefaultLimit;

            var notifications = await (
                from noti in _dbContext.Set<Notification>()
                    .AsNoTracking()
                    .Where(q => q.ContactId == request.ContactId)
                    .OrderByDescending(q => q.CreatedTime)
                    .Skip(request.Limit * (request.Page - 1))
                    .Take(request.Limit)
                from frnd in _dbContext.Set<Friend>()
                    .AsNoTracking()
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
                        var constraintDto = _mapper.Map<Notification, NotificationTypeConstraint>(notification.noti);
                        var friendRequest = _mapper.Map<Friend, NotificationSourceDataType_Friend>(notification.frnd);
                        friendRequest.FriendStatus = notification.frnd.AcceptTime.HasValue == true
                            ? "friend"
                            : notification.frnd.FromContactId == request.ContactId
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
            var query = new GetByConversationId.Query
            {
                ContactId = userId,
                Page = page,
                Limit = limit
            };
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}