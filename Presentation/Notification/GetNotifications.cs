namespace Presentation.Notifications;

public static class GetByConversationId
{
    public record Request(int page, int limit) : IRequest<IEnumerable<Notification>>;

    internal sealed class Handler : IRequestHandler<Request, IEnumerable<Notification>>
    {
        readonly IMapper _mapper;
        readonly INotificationRepository _notificationRepository;
        readonly IContactRepository _contactRepository;

        public Handler(IMapper mapper,
            IService<INotificationRepository> notificationService,
            IService<IContactRepository> contactService)
        {
            _mapper = mapper;
            _notificationRepository = notificationService.Get();
            _contactRepository = contactService.Get();
        }

        public async Task<IEnumerable<Notification>> Handle(Request request, CancellationToken cancellationToken)
        {
            // var userId = _httpContextAccessor.HttpContext.Items["UserId"]?.ToString();
            // var filter = Builders<Notification>.Filter.Where(q => q.ContactId == userId);
            // var notifications = await _notificationRepository.GetAllAsync(filter);
            // if (!notifications.Any()) return Enumerable.Empty<Notification>();

            var user = await _contactRepository.GetInfoAsync();
            var filter = Builders<Notification>.Filter.Where(q => q.ContactId == user.Id);
            return await _notificationRepository.GetAllAsync(filter);

            // var result = new List<NotificationWithSourceData>(notifications.Count());
            // foreach (var notification in notifications)
            // {
            //     switch (notification.SourceType)
            //     {
            //         case "friend_request":
            //             var constraintDto = _mapper.Map<Notification, NotificationWithSourceData>(notification);
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

            // return result;
        }
    }
}

public class GetByConversationIdEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Notification).MapGet("",
        async (HttpContext context, ISender sender, int page = 0, int limit = 0) =>
        {
            var query = new GetByConversationId.Request(page != 0 ? page : AppConstants.DefaultPage, limit != 0 ? limit : AppConstants.DefaultLimit);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}