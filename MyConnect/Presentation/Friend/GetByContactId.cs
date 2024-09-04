namespace Presentation.Friends;

public static class GetByContactId
{
    public record Request(string contactId) : IRequest<IEnumerable<GetAllFriend>>;

    internal sealed class Handler(IUnitOfWork uow) : IRequestHandler<Request, IEnumerable<GetAllFriend>>
    {
        public async Task<IEnumerable<GetAllFriend>> Handle(Request request, CancellationToken cancellationToken)
        {
            // var friends = await (
            //     from frnd in uow.Friend.DbSet
            //     join fromContact in uow.Contact.DbSet on frnd.FromContactId equals fromContact.Id
            //     join toContact in uow.Contact.DbSet on frnd.ToContactId equals toContact.Id
            //     where frnd.FromContactId == request.id || frnd.ToContactId == request.id
            //     select new GetAllFriend
            //     {
            //         Id = frnd.Id,
            //         ContactId = frnd.FromContactId == request.id ? toContact.Id : fromContact.Id,
            //         ContactName = frnd.FromContactId == request.id ? toContact.Name : fromContact.Name,
            //         Status = frnd.AcceptTime.HasValue == true
            //             ? "friend"
            //             : frnd.FromContactId == request.id
            //                 ? "request_sent"
            //                 : "request_received"
            //     }
            // ).ToListAsync(cancellationToken);


            var filter = Builders<Friend>.Filter.Where(q => q.FromContact.ContactId == request.contactId || q.ToContact.ContactId == request.contactId);
            var friends = await uow.Friend.GetAllAsync(filter);

            if (!friends.Any()) return Enumerable.Empty<GetAllFriend>();

            var result = new List<GetAllFriend>(friends.Count());
            foreach (var friend in friends)
                result.Add(new GetAllFriend
                {
                    Id = friend.Id,
                    ContactId = friend.FromContact.ContactId == request.contactId ? friend.ToContact.ContactId : friend.FromContact.ContactId,
                    ContactName = friend.FromContact.ContactId == request.contactId ? friend.ToContact.ContactName : friend.FromContact.ContactName,
                    Status = friend.AcceptTime.HasValue == true
                        ? "friend"
                        : friend.FromContact.ContactId == request.contactId
                            ? "request_sent"
                            : "request_received"
                });

            return result;
        }
    }
}

public class GetByContactIdEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Contact).MapGet("/{contactId}/friends",
        async (ISender sender, string contactId) =>
        {
            var query = new GetByContactId.Request(contactId);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}