namespace Presentation.Friends;

public static class CancelFriend
{
    public record Request(string id) : IRequest<Unit>;

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
            RuleFor(c => c.id).ContactRelatedToFriendRequest(_contactRepository, _friendRepository).DependentRules(() =>
            {
                RuleFor(c => c).MustAsync((item, cancellation) => MustBeSender(item)).WithMessage("Only cancel sent request").DependentRules(() =>
                {
                    RuleFor(c => c.id).NotYetAccepted(_friendRepository);
                });
            });
        }

        async Task<bool> MustBeSender(Request request)
        {
            var user = await _contactRepository.GetInfoAsync();
            var friendRq = await _friendRepository.GetItemAsync(MongoQuery<Friend>.IdFilter(request.id));
            return friendRq.FromContact.ContactId == user.Id;
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        readonly IValidator<Request> _validator;
        readonly IFirebaseFunction _firebase;
        readonly IFriendRepository _friendRepository;
        readonly FriendCache _friendCache;
        readonly UserCache _userCache;
        readonly INotificationProcessor _notificationProcessor;

        public Handler(IValidator<Request> validator, IFirebaseFunction firebase, IFriendRepository friendRepository, FriendCache friendCache, UserCache userCache, INotificationProcessor notificationProcessor)
        {
            _validator = validator;
            _firebase = firebase;
            _friendRepository = friendRepository;
            _friendCache = friendCache;
            _userCache = userCache;
            _notificationProcessor = notificationProcessor;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var filter = MongoQuery<Friend>.IdFilter(request.id);
            _friendRepository.DeleteOne(filter);

            // Update cache
            var friends = await _friendCache.GetFriends();
            var selected = friends.SingleOrDefault(q => q.FriendId == request.id);
            friends = friends.Where(q => q.FriendId != request.id).ToList();
            await _friendCache.SetFriends(friends);

            // Check if receiver is online then update receiver cache
            var receiver = _userCache.GetInfo(selected.Contact.Id);
            if (receiver is not null)
            {
                var receiverFriends = await _friendCache.GetFriends(selected.Contact.Id);
                receiverFriends = receiverFriends.Where(q => q.FriendId != request.id).ToList();
                await _friendCache.SetFriends(selected.Contact.Id, receiverFriends);
            }

            // Push canceled request
            var notiFriendRequest = new EventNewFriendRequest
            {
                FriendId = request.id
            };
            _ = _notificationProcessor.Notify(
                ChatEventNames.FriendRequestCanceled,
                selected.Contact.Id,
                notiFriendRequest
            );

            return Unit.Value;
        }
    }
}

public class CancelFriendEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Friend).MapDelete("/{id}",
        async (ISender sender, string id) =>
        {
            var query = new CancelFriend.Request(id);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization();
    }
}