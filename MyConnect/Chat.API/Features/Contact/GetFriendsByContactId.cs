namespace Chat.API.Features.Contacts;

public static class GetFriendsByContactId
{
    public class Query : IRequest<IEnumerable<GetAllFriend>>
    {
        public Guid Id { get; set; }
    }

    internal sealed class Handler : IRequestHandler<Query, IEnumerable<GetAllFriend>>
    {
        private readonly AppDbContext _dbContext;

        public Handler(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<IEnumerable<GetAllFriend>> Handle(Query request, CancellationToken cancellationToken)
        {
            // var friends = await _dbContext
            // .Friends
            // .AsNoTracking()
            // .Where(q => (q.ContactId1 == request.Id || q.ContactId2 == request.Id) && q.Status == "friend")
            // .ToListAsync(cancellationToken);
            // if (!friends.Any()) return Enumerable.Empty<GetAllFriend>();

            var result = new List<GetAllFriend>();
            // foreach (var friend in friends)
            //     result.Add(new GetAllFriend
            //     {
            //         Id = friend.Id,
            //         ContactId = friend.ContactId1 == request.Id ? friend.ContactId2 : friend.ContactId1,
            //         ContactName = (await _dbContext
            //                         .Contacts
            //                         .AsNoTracking()
            //                         .Where(q => q.Id == (friend.ContactId1 == request.Id ? friend.ContactId2 : friend.ContactId1))
            //                         .FirstOrDefaultAsync(cancellationToken))
            //                         .Name
            //     });

            return result;
        }
    }
}

public class GetFriendsByContactIdEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Contact).MapGet("/{id}/friends",
        async (ISender sender, Guid id) =>
        {
            var query = new GetFriendsByContactId.Query { Id = id };
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}