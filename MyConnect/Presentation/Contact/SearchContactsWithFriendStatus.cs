namespace Presentation.Contacts;

public static class SearchContactsWithFriendStatus
{
    public record Request(string name) : IRequest<IEnumerable<Contact>>;

    internal sealed class Handler(IUnitOfWork uow, IHttpContextAccessor httpContextAccessor) : IRequestHandler<Request, IEnumerable<Contact>>
    {
        public async Task<IEnumerable<Contact>> Handle(Request request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(request.name)) return Enumerable.Empty<Contact>();

            // var userId = httpContextAccessor.HttpContext.Session.GetString("UserId");

            // var contacts = await (
            //     from cust in uow.Contact.DbSet.Where(c => c.Id != request.id && c.Name.Contains(request.name))
            //     from frnd in uow.Friend.DbSet
            //         .Where(f => (f.FromContactId == request.id && f.ToContactId == cust.Id) || (f.FromContactId == cust.Id && f.ToContactId == request.id))
            //         .DefaultIfEmpty()
            //     select new { cust.Id, cust.Name, cust.Avatar, cust.Bio, cust.IsOnline, cust.LastLogout, FriendRequest = frnd }
            //    ).ToListAsync(cancellationToken);

            // if (!contacts.Any()) return Enumerable.Empty<ContactDto>();

            // var result =
            //     from cont in contacts
            //     from frnd in contacts.Select(q => q.FriendRequest).DefaultIfEmpty()
            //     select new ContactDto
            //     {
            //         Id = cont.Id,
            //         Name = cont.Name,
            //         Avatar = cont.Avatar,
            //         Bio = cont.Bio,
            //         IsOnline = cont.IsOnline,
            //         LastLogout = cont.LastLogout,
            //         FriendId = frnd?.Id,
            //         FriendStatus = frnd?.AcceptTime.HasValue == true
            //             ? "friend"
            //             : frnd?.FromContactId == request.id
            //                 ? "request_sent"
            //                 : "request_received"
            //     };
            // return result;

            return null;
        }
    }
}

public class SearchContactsWithFriendStatusEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Contact).MapGet("",
        async (ISender sender, string name) =>
        {
            var query = new SearchContactsWithFriendStatus.Request(name);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}