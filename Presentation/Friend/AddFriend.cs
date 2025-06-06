namespace Presentation.Friends;

public static class AddFriend
{
    public record Request(string contactId) : IRequest<string>;

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
            RuleFor(c => c).MustAsync((item, cancellation) => MustBeSenderAndMustHaveContact(item)).WithMessage("Friend request must be sent to 1 contact").DependentRules(() =>
            {
                RuleFor(c => c).MustAsync((item, cancellation) => UniqueRequest(item)).WithMessage("Friend request has been sent");
            });
        }

        async Task<bool> MustBeSenderAndMustHaveContact(Request request)
        {
            var user = await _contactRepository.GetInfoAsync();
            var mustBeSender = user.Id != request.contactId;
            var mustHaveContact = !string.IsNullOrEmpty(request.contactId);
            return mustBeSender && mustHaveContact;
        }

        async Task<bool> UniqueRequest(Request request)
        {
            var user = await _contactRepository.GetInfoAsync();
            var filter = Builders<Friend>.Filter.Where(q =>
                (q.FromContact.ContactId == user.Id && q.ToContact.ContactId == request.contactId) ||
                (q.FromContact.ContactId == request.contactId && q.ToContact.ContactId == user.Id));
            var friendRq = await _friendRepository.GetAllAsync(filter);
            return !friendRq.Any();
        }
    }

    internal sealed class Handler : IRequestHandler<Request, string>
    {
        readonly IValidator<Request> _validator;
        readonly IFirebaseFunction _firebase;
        readonly IContactRepository _contactRepository;
        readonly IFriendRepository _friendRepository;
        readonly INotificationRepository _notificationRepository;
        readonly IMapper _mapper;
        readonly FriendCache _friendCache;
        readonly UserCache _userCache;
        readonly INotificationProcessor _notificationProcessor;

        public Handler(IValidator<Request> validator, IFirebaseFunction firebase, IContactRepository contactRepository, IFriendRepository friendRepository, INotificationRepository notificationRepository, IMapper mapper, FriendCache friendCache, UserCache userCache, INotificationProcessor notificationProcessor)
        {
            _validator = validator;
            _firebase = firebase;
            _contactRepository = contactRepository;
            _friendRepository = friendRepository;
            _notificationRepository = notificationRepository;
            _mapper = mapper;
            _friendCache = friendCache;
            _userCache = userCache;
            _notificationProcessor = notificationProcessor;
        }

        public async Task<string> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var userId = _contactRepository.GetUserId();

            // Create friend             
            var contactFilter = Builders<Contact>.Filter.Where(q => q.Id == userId || q.Id == request.contactId);
            var contacts = await _contactRepository.GetAllAsync(contactFilter);

            // var fromContact = await _contactRepository.GetItemAsync(MongoQuery<Contact>.IdFilter(userId));
            // var toContact = await _contactRepository.GetItemAsync(MongoQuery<Contact>.IdFilter(request.contactId));
            var fromContact = contacts.SingleOrDefault(q => q.Id == userId);
            var toContact = contacts.SingleOrDefault(q => q.Id == request.contactId);
            var friend = new Friend
            {
                FromContact = new FriendDto_Contact
                {
                    ContactId = fromContact.Id,
                    ContactName = fromContact.Name
                },
                ToContact = new FriendDto_Contact
                {
                    ContactId = toContact.Id,
                    ContactName = toContact.Name
                },
            };
            _friendRepository.Add(friend);

            // Update cache
            var friends = await _friendCache.GetFriends();
            friends.Add(new FriendCacheModel
            {
                Contact = _mapper.Map<ContactInfo>(toContact),
                FriendId = friend.Id,
                FriendStatus = AppConstants.FriendStatus_Sent
            });
            await _friendCache.SetFriends(friends);

            // Check if receiver is online then update receiver cache
            var receiver = _userCache.GetInfo(request.contactId);
            if (receiver is not null)
            {
                var receiverFriends = await _friendCache.GetFriends(request.contactId);
                receiverFriends.Add(new FriendCacheModel
                {
                    Contact = _mapper.Map<ContactInfo>(fromContact),
                    FriendId = friend.Id,
                    FriendStatus = AppConstants.FriendStatus_Received
                });
                await _friendCache.SetFriends(request.contactId, receiverFriends);
            }

            // Create notification            
            var notification = new Notification
            {
                SourceId = friend.Id,
                SourceType = "friend_request",
                Content = $"{fromContact.Name} send you a request",
                ContactId = request.contactId
            };
            _notificationRepository.Add(notification);

            // Push friend request
            var notiFriendRequest = new EventNewFriendRequest
            {
                FriendId = friend.Id,
                ContactId = fromContact.Id
            };
            _ = _notificationProcessor.Notify(
                ChatEventNames.NewFriendRequest,
                toContact.Id,
                notiFriendRequest
            );
            // Push notification
            // var notiDto = _mapper.Map<Notification, NotificationTypeConstraint>(notiEntity);
            // notiDto.AddSourceData(friendEntity);
            // await _firebase.Notify(
            //     "NewNotification",
            //     new string[1] { request.contactId },
            //     notiDto
            // );

            return friend.Id;
        }
    }
}

public class AddFriendEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Friend).MapPost("/{contactId}",
        async (ISender sender, string contactId) =>
        {
            var query = new AddFriend.Request(contactId);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}