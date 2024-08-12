namespace Presentation.Friends;

public static class GetByContactId
{
    public record Request(Guid id) : IRequest<IEnumerable<GetAllFriend>>;

    internal sealed class Handler(IUnitOfWork uow) : IRequestHandler<Request, IEnumerable<GetAllFriend>>
    {
        public async Task<IEnumerable<GetAllFriend>> Handle(Request request, CancellationToken cancellationToken)
        {
            var friends = await (
                from frnd in uow.Friend.DbSet
                join fromContact in uow.Contact.DbSet on frnd.FromContactId equals fromContact.Id
                join toContact in uow.Contact.DbSet on frnd.ToContactId equals toContact.Id
                where frnd.FromContactId == request.id || frnd.ToContactId == request.id
                select new GetAllFriend
                {
                    Id = frnd.Id,
                    ContactId = frnd.FromContactId == request.id ? toContact.Id : fromContact.Id,
                    ContactName = frnd.FromContactId == request.id ? toContact.Name : fromContact.Name,
                    Status = frnd.AcceptTime.HasValue == true
                        ? "friend"
                        : frnd.FromContactId == request.id
                            ? "request_sent"
                            : "request_received"
                }
            ).ToListAsync(cancellationToken);

            if (!friends.Any()) return Enumerable.Empty<GetAllFriend>();

            return friends;
        }
    }
}

public class GetByContactIdEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Contact).MapGet("/{id}/friends",
        async (ISender sender, Guid id) =>
        {
            var query = new GetByContactId.Request(id);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}