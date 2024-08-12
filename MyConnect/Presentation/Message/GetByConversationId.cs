namespace Presentation.Messages;

public static class GetByConversationId
{
    public record Request(Guid conversationId, Guid contactId, int page, int limit) : IRequest<IEnumerable<MessageWithAttachment>>;

    internal sealed class Handler(IUnitOfWork uow, IMapper mapper) : IRequestHandler<Request, IEnumerable<MessageWithAttachment>>
    {
        public async Task<IEnumerable<MessageWithAttachment>> Handle(Request request, CancellationToken cancellationToken)
        {
            var messages = await (
                from mess in uow.Message.DbSet
                    .Where(q => q.ConversationId == request.conversationId)
                    .OrderByDescending(q => q.CreatedTime)
                    .Skip(request.limit * (request.page - 1))
                    .Take(request.limit)
                    // .OrderBy(q => q.CreatedTime)
                from atta in uow.Attachment.DbSet.Where(q => q.MessageId == mess.Id).DefaultIfEmpty()
                select new
                {
                    mess.Id,
                    mess,
                    atta = new MessageWithAttachment_Attachment
                    {
                        Id = atta.Id,
                        Type = atta.Type,
                        MediaUrl = atta.MediaUrl,
                        MediaName = atta.MediaName,
                        MediaSize = atta.MediaSize
                    }
                }
            )
            .ToListAsync(cancellationToken);

            if (!messages.Any()) return Enumerable.Empty<MessageWithAttachment>();

            var result =
                from mess in messages
                group mess by mess.Id into messGrouping
                select new MessageWithAttachment
                {
                    Id = messGrouping.Key,
                    Type = messGrouping.Select(q => q.mess.Type).FirstOrDefault(),
                    Content = messGrouping.Select(q => q.mess.Content).FirstOrDefault(),
                    Status = messGrouping.Select(q => q.mess.Status).FirstOrDefault(),
                    IsPinned = messGrouping.Select(q => q.mess.IsPinned).FirstOrDefault(),
                    IsLike = messGrouping.Select(q => q.mess.IsLike).FirstOrDefault(),
                    LikeCount = messGrouping.Select(q => q.mess.LikeCount).FirstOrDefault(),
                    SeenTime = messGrouping.Select(q => q.mess.SeenTime).FirstOrDefault(),
                    CreatedTime = messGrouping.Select(q => q.mess.CreatedTime).FirstOrDefault(),
                    ContactId = messGrouping.Select(q => q.mess.ContactId).FirstOrDefault(),
                    ConversationId = messGrouping.Select(q => q.mess.ConversationId).FirstOrDefault(),
                    Attachments = messGrouping.Select(q => q.atta).Where(q => q.Id.HasValue).ToList()
                };

            var messagesToBeSeen = mapper.Map<List<MessageWithAttachment>, List<Message>>(result.ToList());
            await SeenAll(request.conversationId, request.contactId);

            return result;
        }

        private async Task SeenAll(Guid conversationId, Guid contactId)
        {
            await uow.Message.DbSet.Where(q => q.ConversationId == conversationId && q.ContactId != contactId && q.Status == "received")
                .ExecuteUpdateAsync(q => q
                    .SetProperty(w => w.Status, "seen")
                    .SetProperty(w => w.SeenTime, DateTime.Now)
                );
        }
    }
}

public class GetByConversationIdEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Conversation).MapGet("/{id}/messages",
        async (HttpContext context, ISender sender, Guid id, int page = 0, int limit = 0) =>
        {
            var userId = Guid.Parse(context.Session.GetString("UserId"));
            var query = new GetByConversationId.Request(id, userId, page != 0 ? page : AppConstants.DefaultPage, limit != 0 ? limit : AppConstants.DefaultLimit);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}