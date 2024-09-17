namespace Presentation.Friends;

public static class AddFriend
{
    public record Request(string contactId, string userId) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        readonly IContactRepository _contactRepository;
        readonly IFriendRepository _friendRepository;

        public Validator(IServiceProvider serviceProvider)
        {
            using (var scope = serviceProvider.CreateScope())
            {
                _contactRepository = scope.ServiceProvider.GetRequiredService<IContactRepository>();
                _friendRepository = scope.ServiceProvider.GetRequiredService<IFriendRepository>();
            }
            RuleFor(c => c.contactId).NotEmpty().WithMessage("Friend request should be sent to 1 contact");
            RuleFor(c => c).MustAsync((item, cancellation) => UniqueRequest(item)).WithMessage("Friend request has been sent");
            RuleFor(c => c.userId).NotEqual(q => q.contactId).WithMessage("Can not send self-request");
        }

        async Task<bool> UniqueRequest(Request request)
        {
            var userfilter = Builders<Contact>.Filter.Where(q => q.UserId == request.userId);
            var user = await _contactRepository.GetItemAsync(userfilter);
            var filter = Builders<Friend>.Filter.Where(q =>
                (q.FromContact.ContactId == user.Id && q.ToContact.ContactId == request.contactId) ||
                (q.FromContact.ContactId == request.contactId && q.ToContact.ContactId == user.Id));
            var sent = await _friendRepository.GetAllAsync(filter);
            return !sent.Any();
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        private readonly IValidator<Request> _validator;
        readonly IHttpContextAccessor _httpContextAccessor;
        private readonly INotificationMethod _notificationMethod;
        private readonly IMapper _mapper;
        private readonly IContactRepository _contactRepository;
        private readonly IFriendRepository _friendRepository;
        private readonly INotificationRepository _notificationRepository;

        public Handler(IValidator<Request> validator,
            IHttpContextAccessor httpContextAccessor,
            INotificationMethod notificationMethod,
            IMapper mapper,
            IUnitOfWork uow)
        {
            _validator = validator;
            _httpContextAccessor = httpContextAccessor;
            _notificationMethod = notificationMethod;
            _mapper = mapper;
            _contactRepository = uow.GetService<IContactRepository>();
            _friendRepository = uow.GetService<IFriendRepository>();
            _notificationRepository = uow.GetService<INotificationRepository>();
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var userId = _httpContextAccessor.HttpContext.Items["UserId"].ToString();
            var filter = Builders<Contact>.Filter.Where(q => q.UserId == userId);
            var user = await _contactRepository.GetItemAsync(filter);

            // Add friend             
            var fromContact = await _contactRepository.GetItemAsync(MongoQuery<Contact>.IdFilter(user.Id));
            var toContact = await _contactRepository.GetItemAsync(MongoQuery<Contact>.IdFilter(request.contactId));
            var friendEntity = new Friend
            {
                FromContact = new FriendDto_Contact
                {
                    ContactId = fromContact.Id,
                    ContactName = fromContact.Name
                },
                ToContact = new FriendDto_Contact
                {
                    ContactId = request.contactId,
                    ContactName = toContact.Name
                },
            };
            _friendRepository.Add(friendEntity);
            // Add notification            
            var notiEntity = new Notification
            {
                SourceId = friendEntity.Id,
                SourceType = "friend_request",
                Content = $"{fromContact.Name} send you a request",
                ContactId = request.contactId
            };
            _notificationRepository.Add(notiEntity);

            //     // Push friend request
            //     await _notificationMethod.Notify(
            //        "NewFriendRequest",
            //        new string[1] { request.contactId },
            //        new FriendToNotify
            //        {
            //            RequestId = friendEntity.Id
            //        }
            //    );
            //     // Push notification
            //     var notiDto = _mapper.Map<Notification, NotificationTypeConstraint>(notiEntity);
            //     notiDto.AddSourceData(friendEntity);
            //     await _notificationMethod.Notify(
            //         "NewNotification",
            //         new string[1] { request.contactId },
            //         notiDto
            //     );

            return Unit.Value;
        }
    }
}

public class AddFriendEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Contact).MapPost("{contactId}/friends",
        async (HttpContext context, ISender sender, string contactId) =>
        {
            var userId = context.Items["UserId"]?.ToString();
            var query = new AddFriend.Request(contactId, userId);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}