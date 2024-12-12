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
        readonly INotificationMethod _notificationMethod;
        readonly IMapper _mapper;
        readonly IContactRepository _contactRepository;
        readonly IFriendRepository _friendRepository;
        readonly INotificationRepository _notificationRepository;

        public Handler(IValidator<Request> validator,
            INotificationMethod notificationMethod,
            IMapper mapper,
            IService<IContactRepository> contactService,
            IService<IFriendRepository> friendService,
            IService<INotificationRepository> notificationService)
        {
            _validator = validator;
            _notificationMethod = notificationMethod;
            _mapper = mapper;
            _contactRepository = contactService.Get();
            _friendRepository = friendService.Get();
            _notificationRepository = notificationService.Get();
        }

        public async Task<string> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var user = await _contactRepository.GetInfoAsync();

            // Add friend             
            var fromContact = await _contactRepository.GetItemAsync(MongoQuery<Contact>.IdFilter(user.Id));
            var toContact = await _contactRepository.GetItemAsync(MongoQuery<Contact>.IdFilter(request.contactId));
            var friend = new Friend
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
            _friendRepository.Add(friend);
            // Console.WriteLine($"friend.Id => {friend.Id}");
            // Add notification            
            var notification = new Notification
            {
                SourceId = friend.Id,
                SourceType = "friend_request",
                Content = $"{fromContact.Name} send you a request",
                ContactId = request.contactId
            };
            // Console.WriteLine($"notification => {JsonConvert.SerializeObject(notification)}");
            _notificationRepository.Add(notification);

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

            return friend.Id;
        }
    }
}

public class AddFriendEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Contact).MapPost("{contactId}/friends",
        async (ISender sender, string contactId) =>
        {
            var query = new AddFriend.Request(contactId);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}