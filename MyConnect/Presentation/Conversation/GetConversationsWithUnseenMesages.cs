namespace Presentation.Conversations;

public static class GetConversationsWithUnseenMesages
{
    public record Request(Guid contactId, int page, int limit) : IRequest<IEnumerable<ConversationWithTotalUnseen>>;

    internal sealed class Handler(IUnitOfWork uow) : IRequestHandler<Request, IEnumerable<ConversationWithTotalUnseen>>
    {
        public async Task<IEnumerable<ConversationWithTotalUnseen>> Handle(Request request, CancellationToken cancellationToken)
        {
            var conversations = await (
                from conv in uow.Conversation.DbSet
                    .Select(q => new { q.Id, q.Title, q.Avatar, q.IsGroup, q.UpdatedTime })
                    .OrderByDescending(q => q.UpdatedTime)
                    .Skip(request.limit * (request.page - 1))
                    .Take(request.limit)
                from mess in uow.Message.DbSet.Where(q => q.ConversationId == conv.Id).DefaultIfEmpty()
                join part in uow.Participant.DbSet on conv.Id equals part.ConversationId
                // join cust in uow.Contact.DbSet on part.ContactId equals cust.Id
                select new
                {
                    conv.Id,
                    conv,
                    part = new ConversationWithTotalUnseen_Participants
                    {
                        Id = part.Id,
                        IsDeleted = part.IsDeleted,
                        IsModerator = part.IsModerator,
                        IsNotifying = part.IsNotifying,
                        ContactId = part.ContactId,
                        Contact = new ConversationWithTotalUnseen_Participants_Contact
                        {
                            // Id = cust.Id,
                            // Name = cust.Name,
                            // Avatar = cust.Avatar
                        }
                    },
                    mess
                }
            )
            .ToListAsync(cancellationToken);
            if (!conversations.Any()) return Enumerable.Empty<ConversationWithTotalUnseen>();

            var result =
                from conv in conversations
                group conv by conv.Id into convGroup
                let conversation = convGroup.Select(q => q.conv).FirstOrDefault()
                let participants = convGroup.Select(q => q.part).DistinctBy(q => q.Id)
                let unseenMessages = convGroup.Select(q => q.mess)
                    .Where(q => q != null)
                    .DistinctBy(q => q.Id)
                    .Where(q => q.ContactId != request.contactId && q.Status == "received")
                    .Count()
                let firstMess = convGroup.Select(q => q.mess)
                    .Where(q => q != null)
                    .DistinctBy(q => q.Id)
                    .OrderByDescending(q => q.CreatedTime)
                    .FirstOrDefault()
                let lastMess = convGroup.Select(q => q.mess)
                    .Where(q => q != null)
                    .DistinctBy(q => q.Id)
                    .Where(q => q.ContactId == request.contactId && q.Status == "seen" && q.SeenTime.HasValue)
                    .OrderByDescending(q => q.CreatedTime)
                    .FirstOrDefault()
                select new ConversationWithTotalUnseen
                {
                    Id = convGroup.Key,
                    Title = conversation.Title,
                    Avatar = conversation.Avatar,
                    IsGroup = conversation.IsGroup,
                    UpdatedTime = conversation.UpdatedTime,
                    IsNotifying = participants.Where(q => q.ContactId == request.contactId).FirstOrDefault().IsNotifying,
                    Participants = participants.Where(q => q.ContactId != request.contactId).ToList(),
                    UnSeenMessages = unseenMessages,
                    LastMessageId = firstMess?.Id,
                    LastMessage = firstMess?.Content,
                    LastMessageTime = firstMess?.CreatedTime,
                    LastMessageContact = firstMess?.ContactId,
                    LastSeenTime = lastMess?.SeenTime
                };
            return result;
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
            var query = new GetConversationsWithUnseenMesages.Request(userId, page != 0 ? page : AppConstants.DefaultPage, limit != 0 ? limit : AppConstants.DefaultLimit);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}