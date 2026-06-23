namespace Presentation.Friends;

// Gợi ý kết bạn theo "bạn chung" (friends-of-friends). Thuật toán depth=2:
//   1. Lấy mọi quan hệ liên quan tới user → relatedIds (loại trừ: đã bạn/đã gửi/đã nhận),
//      và myFriendIds (chỉ những quan hệ đã accept).
//   2. Lấy bạn-của-bạn (đã accept) → đếm số bạn chung cho từng candidate.
//   3. Loại self + relatedIds, sort theo mutualCount giảm dần, cap `limit`.
// Lưu ý scale: cần index trên FromContact.ContactId & ToContact.ContactId; limit chặn kết quả.
public static class GetFriendSuggestions
{
    public record Request(int Limit) : IRequest<IEnumerable<FriendSuggestionItem>>;

    internal sealed class Handler : IRequestHandler<Request, IEnumerable<FriendSuggestionItem>>
    {
        readonly IContactRepository _contactRepository;
        readonly IFriendRepository _friendRepository;
        readonly IPresenceService _presenceService;

        public Handler(IContactRepository contactRepository, IFriendRepository friendRepository, IPresenceService presenceService)
        {
            _contactRepository = contactRepository;
            _friendRepository = friendRepository;
            _presenceService = presenceService;
        }

        public async Task<IEnumerable<FriendSuggestionItem>> Handle(Request request, CancellationToken cancellationToken)
        {
            var limit = Math.Clamp(request.Limit, 1, 20);
            var userId = _contactRepository.GetUserId();

            // 1) Quan hệ của chính user (mọi trạng thái).
            var myRelFilter = Builders<Friend>.Filter.Or(
                Builders<Friend>.Filter.Eq(f => f.FromContact.ContactId, userId),
                Builders<Friend>.Filter.Eq(f => f.ToContact.ContactId, userId));
            var myRels = await _friendRepository.GetAllAsync(myRelFilter);

            var relatedIds = new HashSet<string>();
            var myFriendIds = new HashSet<string>();
            foreach (var r in myRels)
            {
                var other = r.FromContact.ContactId == userId ? r.ToContact.ContactId : r.FromContact.ContactId;
                relatedIds.Add(other);
                if (r.AcceptTime.HasValue) myFriendIds.Add(other);
            }

            // Không có bạn đã accept → không có cơ sở tính bạn chung.
            if (myFriendIds.Count == 0)
                return Enumerable.Empty<FriendSuggestionItem>();

            // 2) Bạn-của-bạn (đã accept).
            var fofFilter = Builders<Friend>.Filter.And(
                Builders<Friend>.Filter.Ne(f => f.AcceptTime, null),
                Builders<Friend>.Filter.Or(
                    Builders<Friend>.Filter.In(f => f.FromContact.ContactId, myFriendIds),
                    Builders<Friend>.Filter.In(f => f.ToContact.ContactId, myFriendIds)));
            var fofs = await _friendRepository.GetAllAsync(fofFilter);

            var mutualCounts = new Dictionary<string, int>();
            void Consider(string candidate)
            {
                // Loại self, người đã có quan hệ (bạn/đã gửi/đã nhận), và chính bạn của mình.
                if (candidate == userId || relatedIds.Contains(candidate) || myFriendIds.Contains(candidate))
                    return;
                mutualCounts[candidate] = mutualCounts.GetValueOrDefault(candidate) + 1;
            }

            foreach (var d in fofs)
            {
                var a = d.FromContact.ContactId;
                var b = d.ToContact.ContactId;
                // Nếu một đầu là bạn của mình thì đầu còn lại là candidate (bạn chung = đầu kia).
                if (myFriendIds.Contains(a)) Consider(b);
                if (myFriendIds.Contains(b)) Consider(a);
            }

            // 3) Sort theo bạn chung giảm dần, cap limit.
            var topIds = mutualCounts
                .OrderByDescending(kv => kv.Value)
                .Take(limit)
                .Select(kv => kv.Key)
                .ToList();

            if (topIds.Count == 0)
                return Enumerable.Empty<FriendSuggestionItem>();

            var contactFilter = Builders<Contact>.Filter.In(c => c.Id, topIds);
            var contacts = await _contactRepository.GetAllAsync(contactFilter);
            var contactById = contacts.ToDictionary(c => c.Id);

            var result = new List<FriendSuggestionItem>();
            foreach (var id in topIds)
            {
                if (!contactById.TryGetValue(id, out var c)) continue;
                result.Add(new FriendSuggestionItem
                {
                    Id = c.Id,
                    Name = c.Name,
                    Avatar = c.Avatar,
                    MutualCount = mutualCounts[id],
                    // Privacy mask: candidate đã tắt ShowOnlineStatus → luôn offline (c là Contact từ DB,
                    // có sẵn Settings nên không cần lookup cache thêm).
                    IsOnline = await _presenceService.IsOnlineAsync(id) && (c.Settings?.ShowOnlineStatus ?? true)
                });
            }

            return result;
        }
    }
}

public class GetFriendSuggestionsEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        // Literal "/suggestions" có precedence cao hơn "/{id}" của GetById → không xung đột route.
        app.MapGroup(AppConstants.ApiGroup_Friend).MapGet("/suggestions",
        async (ISender sender, int? limit) =>
        {
            var result = await sender.Send(new GetFriendSuggestions.Request(limit ?? 10));
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}
