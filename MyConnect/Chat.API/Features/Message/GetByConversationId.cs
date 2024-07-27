namespace Chat.API.Features.Messages;

public static class GetByConversationId
{
    public class Query : IRequest<IEnumerable<MessageWithAttachment>>
    {
        public Guid ConversationId { get; set; }
        public Guid ContactId { get; set; }
        public int Page { get; set; }
        public int Limit { get; set; }
    }

    internal sealed class Handler : IRequestHandler<Query, IEnumerable<MessageWithAttachment>>
    {
        private readonly AppDbContext _dbContext;
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public Handler(AppDbContext dbContext, IUnitOfWork uow, IMapper mapper)
        {
            _dbContext = dbContext;
            _uow = uow;
            _mapper = mapper;
        }

        public async Task<IEnumerable<MessageWithAttachment>> Handle(Query request, CancellationToken cancellationToken)
        {
            request.Page = request.Page != 0 ? request.Page : AppConstants.DefaultPage;
            request.Limit = request.Limit != 0 ? request.Limit : AppConstants.DefaultLimit;

            var messages = await (
                from mess in _dbContext.Set<Message>().AsNoTracking()
                    .Where(q => q.ConversationId == request.ConversationId)
                    .OrderByDescending(q => q.CreatedTime)
                    .Skip(request.Limit * (request.Page - 1))
                    .Take(request.Limit)
                    // .OrderBy(q => q.CreatedTime)
                from atta in _dbContext.Set<Attachment>().AsNoTracking().Where(q => q.MessageId == mess.Id).DefaultIfEmpty()
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

            var messagesToBeSeen = _mapper.Map<List<MessageWithAttachment>, List<Message>>(result.ToList());
            await SeenAll(request.ConversationId, request.ContactId);

            return result;
        }

        private async Task SeenAll(Guid conversationId, Guid contactId)
        {
            await _dbContext.Set<Message>().Where(q => q.ConversationId == conversationId && q.ContactId != contactId && q.Status == "received")
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
            var query = new GetByConversationId.Query
            {
                ConversationId = id,
                ContactId = userId,
                Page = page,
                Limit = limit
            };
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}