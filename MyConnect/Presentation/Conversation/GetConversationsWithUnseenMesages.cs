namespace Presentation.Conversations;

public static class GetConversationsWithUnseenMesages
{
    public record Request(int page, int limit) : IRequest<IEnumerable<object>>;

    internal sealed class Handler : IRequestHandler<Request, IEnumerable<object>>
    {
        private readonly IHttpContextAccessor httpContextAccessor;
        private readonly IConversationRepository conversationRepository;

        public Handler(IHttpContextAccessor httpContextAccessor, IServiceScopeFactory scopeFactory)
        {
            this.httpContextAccessor = httpContextAccessor;
            using (var scope = scopeFactory.CreateScope())
            {
                conversationRepository = scope.ServiceProvider.GetService<IConversationRepository>();
            }
        }

        public async Task<IEnumerable<object>> Handle(Request request, CancellationToken cancellationToken)
        {
            var userId = httpContextAccessor.HttpContext.Session.GetString("UserId");
            var filter = Builders<Conversation>.Filter.Where(q => q.Participants.Any(w => w.Contact.Id == userId));
            var conversations = await conversationRepository.GetAllAsync(filter);

            // var conversations = await (
            //     from conv in uow.Conversation.DbSet
            //         .Select(q => new { q.Id, q.Title, q.Avatar, q.IsGroup, q.UpdatedTime })
            //         .OrderByDescending(q => q.UpdatedTime)
            //         .Skip(request.limit * (request.page - 1))
            //         .Take(request.limit)
            //     from mess in uow.Message.DbSet.Where(q => q.ConversationId == conv.Id).DefaultIfEmpty()
            //     join part in uow.Participant.DbSet on conv.Id equals part.ConversationId
            //     // join cust in uow.Contact.DbSet on part.ContactId equals cust.Id
            //     select new
            //     {
            //         conv.Id,
            //         conv,
            //         part = new ConversationWithTotalUnseen_Participants
            //         {
            //             Id = part.Id,
            //             IsDeleted = part.IsDeleted,
            //             IsModerator = part.IsModerator,
            //             IsNotifying = part.IsNotifying,
            //             ContactId = part.ContactId,
            //             Contact = new ConversationWithTotalUnseen_Participants_Contact
            //             {
            //                 // Id = cust.Id,
            //                 // Name = cust.Name,
            //                 // Avatar = cust.Avatar
            //             }
            //         },
            //         mess
            //     }
            // )
            // .ToListAsync(cancellationToken);
            if (!conversations.Any()) return Enumerable.Empty<ConversationWithTotalUnseen>();

            // var result =
            //     from conv in conversations
            //     group conv by conv.Id into convGroup
            //     let conversation = convGroup.Select(q => q.conv).FirstOrDefault()
            //     let participants = convGroup.Select(q => q.part).DistinctBy(q => q.Id)
            //     let unseenMessages = convGroup.Select(q => q.mess)
            //         .Where(q => q != null)
            //         .DistinctBy(q => q.Id)
            //         .Where(q => q.ContactId != request.contactId && q.Status == "received")
            //         .Count()
            //     let firstMess = convGroup.Select(q => q.mess)
            //         .Where(q => q != null)
            //         .DistinctBy(q => q.Id)
            //         .OrderByDescending(q => q.CreatedTime)
            //         .FirstOrDefault()
            //     let lastMess = convGroup.Select(q => q.mess)
            //         .Where(q => q != null)
            //         .DistinctBy(q => q.Id)
            //         .Where(q => q.ContactId == request.contactId && q.Status == "seen" && q.SeenTime.HasValue)
            //         .OrderByDescending(q => q.CreatedTime)
            //         .FirstOrDefault()
            //     select new ConversationWithTotalUnseen
            //     {
            //         Id = convGroup.Key,
            //         Title = conversation.Title,
            //         Avatar = conversation.Avatar,
            //         IsGroup = conversation.IsGroup,
            //         UpdatedTime = conversation.UpdatedTime,
            //         IsNotifying = participants.Where(q => q.ContactId == request.contactId).FirstOrDefault().IsNotifying,
            //         Participants = participants.Where(q => q.ContactId != request.contactId).ToList(),
            //         UnSeenMessages = unseenMessages,
            //         LastMessageId = firstMess?.Id,
            //         LastMessage = firstMess?.Content,
            //         LastMessageTime = firstMess?.CreatedTime,
            //         LastMessageContact = firstMess?.ContactId,
            //         LastSeenTime = lastMess?.SeenTime
            //     };
            return conversations;
        }
    }
}

public class GetConversationsWithUnseenMesagesEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Conversation).MapGet("",
        async (ISender sender, int page = 0, int limit = 0) =>
        {
            var query = new GetConversationsWithUnseenMesages.Request(page != 0 ? page : AppConstants.DefaultPage, limit != 0 ? limit : AppConstants.DefaultLimit);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}