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
        private readonly IMapper _mapper;

        public Handler(AppDbContext dbContext, IMapper mapper)
        {
            _dbContext = dbContext;
            _mapper = mapper;
        }

        public async Task<IEnumerable<ConversationWithTotalUnseen>> Handle(Query request, CancellationToken cancellationToken)
        {
            request.Page = request.Page != 0 ? request.Page : AppConstants.DefaultPage;
            request.Limit = request.Limit != 0 ? request.Limit : AppConstants.DefaultLimit;
            var conversations = await _dbContext
                .Conversations
                .AsNoTracking()
                .Where(q => q.Participants.Any(w => w.ContactId == request.ContactId))
                .OrderByDescending(q => q.UpdatedTime)
                .Skip(request.Limit * (request.Page - 1))
                .Take(request.Limit)
                .ToListAsync();
            if (!conversations.Any()) return Enumerable.Empty<ConversationWithTotalUnseen>();

            var conversationDTOs = _mapper.Map<List<Conversation>, List<ConversationWithTotalUnseen>>(conversations);
            foreach (var conversation in conversationDTOs)
            {
                var participants = await _dbContext
                                        .Participants
                                        .AsNoTracking()
                                        .Include(q => q.Contact)
                                        .Where(q => q.ConversationId == conversation.Id)
                                        .ToListAsync(cancellationToken);

                conversation.Participants = _mapper.Map<List<Participant>, List<ParticipantNoReference>>(participants);
                conversation.IsNotifying = participants.FirstOrDefault(q => q.ContactId == request.ContactId).IsNotifying;

                var messages = await _dbContext.Messages.Where(q => q.ConversationId == conversation.Id).ToListAsync(cancellationToken);
                conversation.UnSeenMessages = messages.Count(q => q.ContactId != request.ContactId && q.Status == "received");
                var lastMessageEntity = messages.OrderByDescending(q => q.CreatedTime).FirstOrDefault();
                if (lastMessageEntity == null) continue;
                conversation.LastMessageId = lastMessageEntity.Id;
                conversation.LastMessage = lastMessageEntity.Content;
                conversation.LastMessageTime = lastMessageEntity.CreatedTime;
                conversation.LastMessageContact = lastMessageEntity.ContactId;
                conversation.LastSeenTime = messages
                                        .Where(q => q.ContactId == request.ContactId && q.Status == "seen" && q.SeenTime.HasValue)
                                        .OrderByDescending(q => q.CreatedTime)
                                        .FirstOrDefault()?
                                        .SeenTime;
            }
            return conversationDTOs;
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
        }).RequireAuthorization("AllUser");
    }
}