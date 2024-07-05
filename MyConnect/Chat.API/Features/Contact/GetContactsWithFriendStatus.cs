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

        public async Task<IEnumerable<ContactDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(request.Name)) return Enumerable.Empty<ContactDto>();

            var contacts = await _dbContext
            .Contacts
            .AsNoTracking()
            .Where(q => q.Id != request.Id && q.Name.Contains(request.Name))
            .ToListAsync(cancellationToken);
            if (!contacts.Any()) return Enumerable.Empty<ContactDto>();

            var contactDTOs = _mapper.Map<List<Contact>, List<ContactDto>>(contacts);
            foreach (var contact in contactDTOs)
            {
                var friend = await _dbContext
                .Friends
                .AsNoTracking()
                .Where(q => (q.ContactId1 == request.Id && q.ContactId2 == contact.Id) || (q.ContactId1 == contact.Id && q.ContactId2 == request.Id))
                .FirstOrDefaultAsync(cancellationToken);

                if (friend is null) continue;

                contact.FriendId = friend.Id;
                if (friend.Status == "request" && friend.ContactId1 == request.Id)
                    contact.FriendStatus = "request_sent";
                else if (friend.Status == "request" && friend.ContactId2 == request.Id)
                    contact.FriendStatus = "request_received";
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
        }).RequireAuthorization("AllUser");
    }
}