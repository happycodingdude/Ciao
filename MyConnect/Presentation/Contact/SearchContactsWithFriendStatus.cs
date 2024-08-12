namespace Presentation.Contacts;

public static class SearchContactsWithFriendStatus
{
    public record Request(Guid id, string name) : IRequest<IEnumerable<ContactDto>>;

    internal sealed class Handler(IUnitOfWork uow) : IRequestHandler<Request, IEnumerable<ContactDto>>
    {
        public async Task<IEnumerable<ContactDto>> Handle(Request request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(request.name)) return Enumerable.Empty<ContactDto>();

            var contacts = await (
                from cust in uow.Contact.DbSet.Where(c => c.Id != request.id && c.Name.Contains(request.name))
                from frnd in uow.Friend.DbSet
                    .Where(f => (f.FromContactId == request.id && f.ToContactId == cust.Id) || (f.FromContactId == cust.Id && f.ToContactId == request.id))
                    .DefaultIfEmpty()
                select new { cust.Id, cust.Name, cust.Avatar, cust.Bio, cust.IsOnline, cust.LastLogout, FriendRequest = frnd }
               ).ToListAsync(cancellationToken);

            if (!contacts.Any()) return Enumerable.Empty<ContactDto>();

            var result =
                from cont in contacts
                from frnd in contacts.Select(q => q.FriendRequest).DefaultIfEmpty()
                select new ContactDto
                {
                    Id = cont.Id,
                    Name = cont.Name,
                    Avatar = cont.Avatar,
                    Bio = cont.Bio,
                    IsOnline = cont.IsOnline,
                    LastLogout = cont.LastLogout,
                    FriendId = frnd?.Id,
                    FriendStatus = frnd?.AcceptTime.HasValue == true
                        ? "friend"
                        : frnd?.FromContactId == request.id
                            ? "request_sent"
                            : "request_received"
                };
            return result;
        }
    }
}

public class SearchContactsWithFriendStatusEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Contact).MapGet("",
        async (HttpContext context, ISender sender, [FromQuery] string name) =>
        {
            var userId = Guid.Parse(context.Session.GetString("UserId"));
            var query = new SearchContactsWithFriendStatus.Request(userId, name);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}