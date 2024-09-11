namespace Presentation.Friends;

public static class CreateFriend
{
    public record Request(string userId, string contactId) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        readonly IFriendRepository _friendRepository;

        public Validator(IServiceScopeFactory scopeFactory)
        {
            using (var scope = scopeFactory.CreateScope())
            {
                _friendRepository = scope.ServiceProvider.GetService<IFriendRepository>();
            }
            RuleFor(c => c.contactId).NotEmpty().WithMessage("Friend request should be sent to 1 contact");
            RuleFor(c => c).MustAsync((item, cancellation) => UniqueRequest(item)).WithMessage("Friend request has been sent");
            RuleFor(c => c.userId).NotEqual(q => q.contactId).WithMessage("Can not send self-request");
        }

        async Task<bool> UniqueRequest(Request request)
        {
            var filter = Builders<Friend>.Filter.Where(q =>
                (q.FromContact.ContactId == request.userId && q.ToContact.ContactId == request.contactId) ||
                (q.FromContact.ContactId == request.contactId && q.ToContact.ContactId == request.userId));
            var sent = await _friendRepository.GetAllAsync(filter);
            return !sent.Any();
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        private readonly IValidator<Request> validator;
        private readonly INotificationMethod notificationMethod;
        private readonly IUnitOfWork uow;
        private readonly IMapper mapper;
        private readonly IContactRepository contactRepository;
        private readonly IFriendRepository friendRepository;
        private readonly INotificationRepository notificationRepository;

        public Handler(IValidator<Request> validator, INotificationMethod notificationMethod, IUnitOfWork uow, IServiceScopeFactory scopeFactory, IMapper mapper)
        {
            this.validator = validator;
            this.notificationMethod = notificationMethod;
            this.uow = uow;
            this.mapper = mapper;
            using (var scope = scopeFactory.CreateScope())
            {
                contactRepository = scope.ServiceProvider.GetService<IContactRepository>();
                friendRepository = scope.ServiceProvider.GetService<IFriendRepository>();
                notificationRepository = scope.ServiceProvider.GetService<INotificationRepository>();
            }
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            // Add friend 
            var fromContact = await contactRepository.GetItemAsync(MongoQuery.IdFilter<Contact>(request.userId));
            var toContact = await contactRepository.GetItemAsync(MongoQuery.IdFilter<Contact>(request.contactId));
            var friendEntity = new Friend
            {
                FromContact = new FriendDto_Contact
                {
                    ContactId = request.userId,
                    ContactName = fromContact.Name
                },
                ToContact = new FriendDto_Contact
                {
                    ContactId = request.contactId,
                    ContactName = toContact.Name
                },
            };
            friendRepository.Add(friendEntity);
            // Add notification            
            var notiEntity = new Notification
            {
                SourceId = friendEntity.Id,
                SourceType = "friend_request",
                Content = $"{fromContact.Name} send you a request",
                ContactId = request.contactId
            };
            notificationRepository.Add(notiEntity);

            await uow.SaveAsync();

            // Push friend request
            await notificationMethod.Notify(
               "NewFriendRequest",
               new string[1] { request.contactId },
               new FriendToNotify
               {
                   RequestId = friendEntity.Id
               }
           );
            // Push notification
            var notiDto = mapper.Map<Notification, NotificationTypeConstraint>(notiEntity);
            notiDto.AddSourceData(friendEntity);
            await notificationMethod.Notify(
                "NewNotification",
                new string[1] { request.contactId },
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
        app.MapGroup(AppConstants.ApiRoute_Contact).MapPost("{contactId}/friends",
        async (HttpContext context, ISender sender, string contactId) =>
        {
            var userId = context.Session.GetString("UserId");
            var query = new CreateFriend.Request(userId, contactId);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}