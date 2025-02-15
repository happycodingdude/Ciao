namespace Presentation.Friends;

public static class GetByContactId
{
    public record Request(string contactId) : IRequest<IEnumerable<FriendWithStatus>>;

    internal sealed class Handler : IRequestHandler<Request, IEnumerable<FriendWithStatus>>
    {
        readonly IMapper _mapper;
        readonly IFriendRepository _friendRepository;

        public Handler(IMapper mapper, IFriendRepository friendRepository)
        {
            _mapper = mapper;
            _friendRepository = friendRepository;
        }

        public async Task<IEnumerable<FriendWithStatus>> Handle(Request request, CancellationToken cancellationToken)
        {
            var filter = Builders<Friend>.Filter.Where(q => q.FromContact.ContactId == request.contactId || q.ToContact.ContactId == request.contactId);
            var friends = await _friendRepository.GetAllAsync(filter);
            if (!friends.Any()) return Enumerable.Empty<FriendWithStatus>();

            var result = new List<FriendWithStatus>(friends.Count());
            foreach (var friend in friends)
            {
                var friendWithStatus = _mapper.Map<Friend, FriendWithStatus>(friend);
                friendWithStatus.Status = await _friendRepository.GetFriendStatusAsync(friend);
                result.Add(friendWithStatus);
            }

            return result;
        }
    }
}

public class GetByContactIdEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Contact).MapGet("/{contactId}/friends",
        async (ISender sender, string contactId) =>
        {
            var query = new GetByContactId.Request(contactId);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}