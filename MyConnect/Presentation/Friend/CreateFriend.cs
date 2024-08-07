namespace Presentation.Friends;

public static class CreateFriend
{
    public class Query : IRequest<Unit>
    {
        public Guid FromContactId { get; set; }
        public Guid ToContactId { get; set; }
    }

    public class Validator : AbstractValidator<Query>
    {
        readonly IServiceScopeFactory _scopeFactory;

        public Validator(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
            RuleFor(c => c.ToContactId).NotEmpty().WithMessage("Friend request should be sent to 1 contact");
            RuleFor(c => c).Must(UniqueRequest).WithMessage("Friend request has been sent");
            RuleFor(c => c.ToContactId).NotEqual(q => q.FromContactId).WithMessage("Can not send self-request");
        }

        private bool UniqueRequest(Query request)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var sent = dbContext.Friends.AsNoTracking()
                    .Any(q => (q.FromContactId == request.FromContactId && q.ToContactId == request.ToContactId)
                            || q.FromContactId == request.ToContactId && q.ToContactId == request.FromContactId);
                return !sent;
            }
        }
    }

    internal sealed class Handler : IRequestHandler<Query, Unit>
    {
        private readonly IValidator<Query> _validator;
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;
        private readonly INotificationMethod _notificationMethod;

        public Handler(IValidator<Query> validator, IUnitOfWork uow, IMapper mapper, INotificationMethod notificationMethod)
        {
            _uow = uow;
            _validator = validator;
            _mapper = mapper;
            _notificationMethod = notificationMethod;
        }

        public async Task<Unit> Handle(Query request, CancellationToken cancellationToken)
        {
            var validationResult = _validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            // Add friend 
            var friendEntity = new Friend
            {
                FromContactId = request.FromContactId,
                ToContactId = request.ToContactId
            };
            _uow.Friend.Add(friendEntity);
            // Add notification
            var contact = await _uow.Contact.GetByIdAsync(request.FromContactId);
            var notiEntity = new Notification
            {
                SourceId = friendEntity.Id,
                SourceType = "friend_request",
                Content = $"{contact.Name} send you a request",
                ContactId = request.ToContactId
            };
            _uow.Notification.Add(notiEntity);

            await _uow.SaveAsync();

            // Push friend request
            await _notificationMethod.Notify(
               "NewFriendRequest",
               new string[1] { request.ToContactId.ToString() },
               new FriendToNotify
               {
                   RequestId = friendEntity.Id
               }
           );
            // Push notification
            var notiDto = _mapper.Map<Notification, NotificationTypeConstraint>(notiEntity);
            notiDto.AddSourceData(friendEntity);
            await _notificationMethod.Notify(
                "NewNotification",
                new string[1] { request.ToContactId.ToString() },
                notiDto
            );

            return Unit.Value;
        }
    }
}

public class CreateFriendEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Friend).MapPost("{id}",
        async (HttpContext context, ISender sender, Guid id) =>
        {
            var userId = Guid.Parse(context.Session.GetString("UserId"));
            var query = new CreateFriend.Query
            {
                FromContactId = userId,
                ToContactId = id
            };
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}