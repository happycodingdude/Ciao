public static class GetConversationsWithUnseenMesages
{
    public class Query : IRequest<IEnumerable<ConversationWithTotalUnseen>>
    {
        public int Page { get; set; }
        public int Limit { get; set; }
        public Guid ContactId { get; set; }
    }

    internal sealed class Handler : IRequestHandler<Query, IEnumerable<ConversationWithTotalUnseen>>
    {
        private readonly AppDbContext _dbContext;

        public Handler(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<IEnumerable<ConversationWithTotalUnseen>> Handle(Query request, CancellationToken cancellationToken)
        {
            request.Page = request.Page != 0 ? request.Page : AppConstants.DefaultPage;
            request.Limit = request.Limit != 0 ? request.Limit : AppConstants.DefaultLimit;

            var conversations = await (
                from conv in _dbContext.Set<Conversation>().AsNoTracking()
                    .Select(q => new { q.Id, q.Title, q.Avatar, q.IsGroup, q.UpdatedTime })
                    .OrderByDescending(q => q.UpdatedTime)
                    .Skip(request.Limit * (request.Page - 1))
                    .Take(request.Limit)
                from mess in _dbContext.Set<Message>().AsNoTracking().Where(q => q.ConversationId == conv.Id).DefaultIfEmpty()
                join part in _dbContext.Set<Participant>().AsNoTracking() on conv.Id equals part.ConversationId
                join cust in _dbContext.Set<Contact>().AsNoTracking() on part.ContactId equals cust.Id
                where part.ContactId != request.ContactId
                select new
                {
                    conv.Id,
                    conv.Title,
                    conv.Avatar,
                    conv.IsGroup,
                    conv.UpdatedTime,
                    Participant = new ConversationWithTotalUnseen_Participants
                    {
                        Id = part.Id,
                        IsDeleted = part.IsDeleted,
                        IsModerator = part.IsModerator,
                        IsNotifying = part.IsNotifying,
                        ContactId = part.ContactId,
                        Contact = new ConversationWithTotalUnseen_Participants_Contact
                        {
                            Id = cust.Id,
                            Name = cust.Name,
                            Avatar = cust.Avatar
                        }
                    },
                    Message = new { mess.Id, mess.Content, mess.CreatedTime, mess.ContactId, mess.Status, mess.SeenTime } ?? null
                }
            )
            .ToListAsync(cancellationToken);

            if (!conversations.Any()) return Enumerable.Empty<ConversationWithTotalUnseen>();

            var result =
                from conv in conversations
                    // group conv by new { conv.Id, conv.Avatar, conv.IsGroup, conv.UpdatedTime } into convGroup
                group conv by conv.Id into convGroup
                from firstMess in convGroup.Select(q => q.Message).DistinctBy(q => q.Id).OrderByDescending(q => q.CreatedTime).DefaultIfEmpty()
                select new ConversationWithTotalUnseen
                {
                    Id = convGroup.Key,
                    Title = convGroup.Select(q => q.Title).FirstOrDefault(),
                    Avatar = convGroup.Select(q => q.Avatar).FirstOrDefault(),
                    IsGroup = convGroup.Select(q => q.IsGroup).FirstOrDefault(),
                    UpdatedTime = convGroup.Select(q => q.UpdatedTime).FirstOrDefault(),
                    Participants = convGroup.Select(q => q.Participant).DistinctBy(q => q.Id).ToList(),
                    UnSeenMessages = convGroup.Select(q => q.Message).DistinctBy(q => q.Id)
                        .Count(q => q.ContactId != request.ContactId && q.Status == "received"),
                    LastMessageId = firstMess?.Id,
                    LastMessage = firstMess?.Content,
                    LastMessageTime = firstMess?.CreatedTime,
                    LastMessageContact = firstMess?.ContactId,
                    LastSeenTime = convGroup.Select(q => q.Message).DistinctBy(q => q.Id)
                        .Where(q => q.ContactId == request.ContactId && q.Status == "seen" && q.SeenTime.HasValue)
                        .OrderByDescending(q => q.CreatedTime)
                        .FirstOrDefault()?
                        .SeenTime,
                };
            return result.DistinctBy(q => q.Id);
        }
    }
}

public class GetConversationsWithUnseenMesagesEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Conversation).MapGet("",
        async (HttpContext context, ISender sender, int page = 0, int limit = 0) =>
        {
            var userId = Guid.Parse(context.Session.GetString("UserId"));
            var query = new GetConversationsWithUnseenMesages.Query
            {
                ContactId = userId,
                Page = page,
                Limit = limit
            };
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization("Basic");
    }
}