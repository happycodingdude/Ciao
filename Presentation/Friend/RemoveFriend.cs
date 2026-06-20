namespace Presentation.Friends;

// Tổng quát hoá việc xoá quan hệ bạn bè qua DELETE /friends/{id}, bao trùm 3 ca:
//   - Cancel : người gửi huỷ lời mời mình gửi (chưa accept)
//   - Deny   : người nhận từ chối lời mời (chưa accept)
//   - Unfriend: một trong hai phía huỷ kết bạn (đã accept)
// Cả 3 đều là DeleteOne + đồng bộ FriendCache 2 phía; chỉ khác event đẩy về phía còn lại.
public static class RemoveFriend
{
    public record Request(string id) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        public Validator(IContactRepository contactRepository, IFriendRepository friendRepository)
        {
            // Chỉ cần là participant (FromContact hoặc ToContact). Bỏ MustBeSender/NotYetAccepted
            // vì giờ cho phép cả deny (receiver) lẫn unfriend (đã accept).
            RuleFor(c => c.id).ContactRelatedToFriendRequest(contactRepository, friendRepository);
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        readonly IValidator<Request> _validator;
        readonly IContactRepository _contactRepository;
        readonly IFriendRepository _friendRepository;
        readonly FriendCache _friendCache;
        readonly UserCache _userCache;
        readonly IFirebaseFunction _firebase;

        public Handler(IValidator<Request> validator, IContactRepository contactRepository, IFriendRepository friendRepository, FriendCache friendCache, UserCache userCache, IFirebaseFunction firebase)
        {
            _validator = validator;
            _contactRepository = contactRepository;
            _friendRepository = friendRepository;
            _friendCache = friendCache;
            _userCache = userCache;
            _firebase = firebase;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var filter = MongoQuery<Friend>.IdFilter(request.id);
            // Đọc entity trước khi xoá để xác định ngữ nghĩa event (accepted? ai thao tác?).
            var entity = await _friendRepository.GetItemAsync(filter);

            _friendRepository.DeleteOne(filter);

            // Phân loại event đẩy về phía còn lại qua Firebase (FCM). Client lắng nghe trong
            // notificationHandlers để cập nhật cache realtime (xoá entry theo friendId).
            var userId = _contactRepository.GetUserId();
            var wasAccepted = entity?.AcceptTime.HasValue ?? false;
            var isReceiver = entity?.ToContact.ContactId == userId;
            var eventName = wasAccepted
                ? ChatEventNames.Unfriended
                : isReceiver
                    ? ChatEventNames.FriendRequestDenied
                    : ChatEventNames.FriendRequestCanceled;

            // Cập nhật cache của chính user hiện tại.
            var friends = await _friendCache.GetFriends();
            var selected = friends?.SingleOrDefault(q => q.FriendId == request.id);
            if (friends is not null)
            {
                friends = friends.Where(q => q.FriendId != request.id).ToList();
                await _friendCache.SetFriends(friends);
            }

            // Cập nhật cache + notify phía còn lại (idempotent: bỏ qua nếu không xác định được).
            if (selected is not null)
            {
                var otherId = selected.Contact.Id;

                var other = _userCache.GetInfo(otherId);
                if (other is not null)
                {
                    var otherFriends = await _friendCache.GetFriends(otherId);
                    if (otherFriends is not null)
                    {
                        otherFriends = otherFriends.Where(q => q.FriendId != request.id).ToList();
                        await _friendCache.SetFriends(otherId, otherFriends);
                    }
                }

                _ = _firebase.Notify(
                    eventName,
                    new[] { otherId },
                    new EventNewFriendRequest { FriendId = request.id }
                );
            }

            return Unit.Value;
        }
    }
}

public class RemoveFriendEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Friend).MapDelete("/{id}",
        async (ISender sender, string id) =>
        {
            var query = new RemoveFriend.Request(id);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization();
    }
}
