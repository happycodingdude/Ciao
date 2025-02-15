namespace Presentation.Friends;

public static class AddFriend
{
    public record Request(string conversationId, string contactId) : IRequest<string>;

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
        readonly MemberCache _memberCache;

        public Handler(IValidator<Request> validator,
            IFirebaseFunction firebase,
            IContactRepository contactRepository,
            IFriendRepository friendRepository,
            INotificationRepository notificationRepository,
            MemberCache memberCache)
        {
            _validator = validator;
            _firebase = firebase;
            _contactRepository = contactRepository;
            _friendRepository = friendRepository;
            _notificationRepository = notificationRepository;
            _memberCache = memberCache;
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

            // Update cache
            // var members = await _memberCache.GetMembers(request.conversationId);
            // var selected = members.SingleOrDefault(q => q.FriendId == request.id);
            // selected.FriendId = friend.Id;
            // selected.FriendStatus = "request_sent";
            // await _memberCache.UpdateMembers(request.conversationId, members);

            // Add notification            
            var notification = new Notification
            {
                SourceId = friend.Id,
                SourceType = "friend_request",
                Content = $"{fromContact.Name} send you a request",
                ContactId = request.contactId
            };
            _notificationRepository.Add(notification);

            //     // Push friend request
            //     await _firebase.Notify(
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
            //     await _firebase.Notify(
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
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapPost("{conversationId}/friends/{contactId}",
        async (ISender sender, string conversationId, string contactId) =>
        {
            var query = new AddFriend.Request(conversationId, contactId);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}