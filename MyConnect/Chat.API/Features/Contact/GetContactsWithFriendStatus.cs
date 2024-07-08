public static class GetContactsWithFriendStatus
{
    public class Query : IRequest<IEnumerable<ContactDto>>
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
    }

    internal sealed class Handler : IRequestHandler<Query, IEnumerable<ContactDto>>
    {
        private readonly AppDbContext _dbContext;
        private readonly IMapper _mapper;

        public Handler(AppDbContext dbContext, IMapper mapper)
        {
            _dbContext = dbContext;
            _mapper = mapper;
        }

        // public async Task<IEnumerable<ContactDto>> Handle(Query request, CancellationToken cancellationToken)
        // {
        //     if (string.IsNullOrEmpty(request.Name)) return Enumerable.Empty<ContactDto>();

        //     var contacts = await _dbContext
        //     .Contacts
        //     .AsNoTracking()
        //     .Where(q => q.Id != request.Id && q.Name.Contains(request.Name))
        //     .ToListAsync(cancellationToken);
        //     if (!contacts.Any()) return Enumerable.Empty<ContactDto>();

        //     var contactDTOs = _mapper.Map<List<Contact>, List<ContactDto>>(contacts);
        //     foreach (var contact in contactDTOs)
        //     {
        //         var friend = await _dbContext
        //         .Friends
        //         .AsNoTracking()
        //         .Where(q => (q.ContactId1 == request.Id && q.ContactId2 == contact.Id) || (q.ContactId1 == contact.Id && q.ContactId2 == request.Id))
        //         .FirstOrDefaultAsync(cancellationToken);

        //         if (friend is null) continue;

        //         contact.FriendId = friend.Id;
        //         if (friend.Status == "request" && friend.ContactId1 == request.Id)
        //             contact.FriendStatus = "request_sent";
        //         else if (friend.Status == "request" && friend.ContactId2 == request.Id)
        //             contact.FriendStatus = "request_received";
        //     }

        //     return contactDTOs;
        // }
        public async Task<IEnumerable<ContactDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(request.Name)) return Enumerable.Empty<ContactDto>();

            // var contacts = await (
            //     from c in _dbContext.Set<Contact>().AsNoTracking()
            //     join f in _dbContext.Set<Friend>().AsNoTracking()
            //         on new { ContactId1 = request.Id, ContactId2 = c.Id, Status = "request" } equals new { f.ContactId1, f.ContactId2, f.Status }
            //         into sentRequest
            //     from sr in sentRequest.DefaultIfEmpty()
            //     join f in _dbContext.Set<Friend>().AsNoTracking()
            //         on new { ContactId1 = c.Id, ContactId2 = request.Id, Status = "request" } equals new { f.ContactId1, f.ContactId2, f.Status }
            //         into receivedRequest
            //     from rr in receivedRequest.DefaultIfEmpty()
            //     where c.Id != request.Id && c.Name.Contains(request.Name)
            //     select new ContactDto
            //     {
            //         Id = c.Id,
            //         Name = c.Name,
            //         Avatar = c.Avatar,
            //         Bio = c.Bio,
            //         IsOnline = c.IsOnline,
            //         LastLogout = c.LastLogout,
            //         FriendId = sr.Id,
            //         FriendStatus = sr.Status
            //     }
            //     ).ToListAsync();

            // var contacts = await (
            //    from c in _dbContext.Set<Contact>().AsNoTracking()
            //    join f in _dbContext.Set<Friend>().AsNoTracking()
            //        on new { ContactId1 = request.Id, ContactId2 = c.Id, Status = "request" } equals new { f.ContactId1, f.ContactId2, f.Status }
            //        into sentRequest
            //    from sr in sentRequest.DefaultIfEmpty()
            //    join f in _dbContext.Set<Friend>().AsNoTracking()
            //        on new { ContactId1 = c.Id, ContactId2 = request.Id, Status = "request" } equals new { f.ContactId1, f.ContactId2, f.Status }
            //        into receivedRequest
            //    from rr in receivedRequest.DefaultIfEmpty()
            //    where c.Id != request.Id && c.Name.Contains(request.Name)
            //    select new
            //    {
            //        c.Id,
            //        c.Name,
            //        c.Avatar,
            //        c.Bio,
            //        c.IsOnline,
            //        c.LastLogout,
            //        SentRequestId = (Guid?)sr.Id,
            //        ReceivedRequestId = (Guid?)rr.Id
            //    }
            //    ).ToListAsync();

            var contacts = await (
                from c in _dbContext.Set<Contact>().AsNoTracking().Where(c => c.Id != request.Id && c.Name.Contains(request.Name))
                from f in _dbContext.Set<Friend>()
                    .AsNoTracking()
                    .Where(f => (f.FromContactId == request.Id && f.ToContactId == c.Id) || (f.FromContactId == c.Id && f.ToContactId == request.Id))
                    .DefaultIfEmpty()
                select new
                {
                    c.Id,
                    c.Name,
                    c.Avatar,
                    c.Bio,
                    c.IsOnline,
                    c.LastLogout,
                    FriendRequest = f
                }
               ).ToListAsync();

            if (!contacts.Any()) return Enumerable.Empty<ContactDto>();

            var contactDTOs = new List<ContactDto>(contacts.Count);
            foreach (var contact in contacts)
            {
                var dto = new ContactDto
                {
                    Id = contact.Id,
                    Name = contact.Name,
                    Avatar = contact.Avatar,
                    Bio = contact.Bio,
                    IsOnline = contact.IsOnline,
                    LastLogout = contact.LastLogout,
                };
                if (contact.FriendRequest is not null)
                {
                    dto.FriendId = contact.FriendRequest.Id;

                    dto.FriendStatus = contact.FriendRequest.AcceptTime.HasValue
                        ? "friend"
                        : contact.FriendRequest.FromContactId == request.Id
                            ? "request_sent"
                            : "request_received";
                }
                contactDTOs.Add(dto);
            }

            return contactDTOs;
        }
    }
}

public class GetContactsWithFriendStatusEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Contact).MapGet("",
        async (HttpContext context, ISender sender, [FromQuery] string name) =>
        {
            var userId = Guid.Parse(context.Session.GetString("UserId"));
            var query = new GetContactsWithFriendStatus.Query
            {
                Id = userId,
                Name = name
            };

            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}