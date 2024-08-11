namespace Presentation.Contacts;

public static class SearchContactsWithFriendStatus
{
    public class Query : IRequest<IEnumerable<ContactDto>>
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
    }

    internal sealed class Handler : IRequestHandler<Query, IEnumerable<ContactDto>>
    {
        private readonly IUnitOfWork _uow;

        public Handler(IUnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<IEnumerable<ContactDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(request.Name)) return Enumerable.Empty<ContactDto>();

            var contacts = await (
                from cust in _uow.Contact.DbSet.Where(c => c.Id != request.Id && c.Name.Contains(request.Name))
                from frnd in _uow.Friend.DbSet
                    .Where(f => (f.FromContactId == request.Id && f.ToContactId == cust.Id) || (f.FromContactId == cust.Id && f.ToContactId == request.Id))
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
                        : frnd?.FromContactId == request.Id
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
            var query = new SearchContactsWithFriendStatus.Query
            {
                Id = userId,
                Name = name
            };

            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}