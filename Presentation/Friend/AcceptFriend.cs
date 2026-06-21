namespace Presentation.Friends;

public static class AcceptFriend
{
    public record Request(string id) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        readonly IContactRepository _contactRepository;
        readonly IFriendRepository _friendRepository;

        public Validator(IContactRepository contactRepository, IFriendRepository friendRepository)
        {
            _contactRepository = contactRepository;
            _friendRepository = friendRepository;
            RuleFor(c => c.id).ContactRelatedToFriendRequest(_contactRepository, _friendRepository).DependentRules(() =>
            {
                RuleFor(c => c).MustAsync((item, cancellation) => MustBeReceiver(item)).WithMessage("Only accept received request").DependentRules(() =>
                {
                    RuleFor(c => c.id).NotYetAccepted(_friendRepository);
                });
            });
        }

        async Task<bool> MustBeReceiver(Request request)
        {
            var user = await _contactRepository.GetInfoAsync();
            var friendRq = await _friendRepository.GetItemAsync(MongoQuery<Friend>.IdFilter(request.id));
            return friendRq.ToContact.ContactId == user.Id;
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        readonly IValidator<Request> _validator;
        readonly IFirebaseFunction _firebase;
        readonly IFriendRepository _friendRepository;
        readonly FriendCache _friendCache;
        readonly UserCache _userCache;

        public Handler(IValidator<Request> validator, IFirebaseFunction firebase, IFriendRepository friendRepository, FriendCache friendCache, UserCache userCache)
        {
            _validator = validator;
            _firebase = firebase;
            _friendRepository = friendRepository;
            _friendCache = friendCache;
            _userCache = userCache;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var filter = MongoQuery<Friend>.IdFilter(request.id);

            // Lấy entity từ DB để biết người GỬI (FromContact) — dùng cho notify/sync cache phía họ.
            // Không phụ thuộc Redis cache (có thể trống) → tránh NRE làm rollback transaction.
            var entity = await _friendRepository.GetItemAsync(filter);
            if (entity is null)
                throw new BadRequestException("Friend request not found");
            var senderId = entity.FromContact.ContactId;

            // CORE: set AcceptTime. Update bị DEFER vào UnitOfWork → chỉ commit ở uow.SaveAsync()
            // (GlobalTransactionMiddleware) SAU khi handler chạy xong. Vì vậy MỌI code phía sau
            // PHẢI null-safe, không được throw — nếu throw thì SaveAsync không chạy, AcceptTime
            // không persist (DB lệch cache "friend") → GetFriendSuggestions/DB thấy sai trạng thái.
            var updates = Builders<Friend>.Update.Set(q => q.AcceptTime, DateTime.UtcNow);
            _friendRepository.Update(filter, updates);

            // Sync cache phía người nhận (chính là user hiện tại). Best-effort, null-safe:
            // cache có thể trống nếu user chưa được build cache (chưa login phiên này...).
            var friends = await _friendCache.GetFriends();
            var selected = friends?.SingleOrDefault(q => q.FriendId == request.id);
            if (selected is not null)
            {
                selected.FriendStatus = AppConstants.FriendStatus_Friend;
                await _friendCache.SetFriends(friends!);
            }

            // Sync cache phía người gửi nếu họ đang online (có thông tin trong UserCache).
            var sender = await _userCache.GetInfo(senderId);
            if (sender is not null)
            {
                var senderFriends = await _friendCache.GetFriends(senderId);
                var senderSelected = senderFriends?.SingleOrDefault(q => q.FriendId == request.id);
                if (senderSelected is not null)
                {
                    senderSelected.FriendStatus = AppConstants.FriendStatus_Friend;
                    await _friendCache.SetFriends(senderId, senderFriends!);
                }
            }

            // Push accepted request tới người gửi (FCM giao cả khi offline → mở app sẽ nhận).
            var notiFriendRequest = new EventNewFriendRequest
            {
                FriendId = request.id
            };
            _ = _firebase.Notify(
                ChatEventNames.FriendRequestAccepted,
                new[] { senderId },
                notiFriendRequest
            );

            return Unit.Value;
        }
    }
}

public class AcceptFriendEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Friend).MapPut("/{id}",
        async (ISender sender, string id) =>
        {
            var query = new AcceptFriend.Request(id);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization();
    }
}