namespace Chat.API.Features.Conversations;

public static class GetConversationsWithUnseenMesages
{
    public class Query : IRequest<IEnumerable<object>>
    {
        public Guid ContactId { get; set; }
        public int Page { get; set; }
        public int Limit { get; set; }
    }

    internal sealed class Handler : IRequestHandler<Query, IEnumerable<object>>
    {
        private readonly AppDbContext _dbContext;

        public Handler(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // public async Task<IEnumerable<ConversationWithTotalUnseen>> Handle(Query request, CancellationToken cancellationToken)
        // {
        //     request.Page = request.Page != 0 ? request.Page : AppConstants.DefaultPage;
        //     request.Limit = request.Limit != 0 ? request.Limit : AppConstants.DefaultLimit;

        //     var conversations = await (
        //         from conv in _dbContext.Set<Conversation>().AsNoTracking()
        //             .Select(q => new { q.Id, q.Title, q.Avatar, q.IsGroup, q.UpdatedTime })
        //             .OrderByDescending(q => q.UpdatedTime)
        //             .Skip(request.Limit * (request.Page - 1))
        //             .Take(request.Limit)
        //         from mess in _dbContext.Set<Message>().AsNoTracking().Where(q => q.ConversationId == conv.Id).DefaultIfEmpty()
        //         join part in _dbContext.Set<Participant>().AsNoTracking() on conv.Id equals part.ConversationId
        //         join cust in _dbContext.Set<Contact>().AsNoTracking() on part.ContactId equals cust.Id
        //         select new
        //         {
        //             conv.Id,
        //             conv.Title,
        //             conv.Avatar,
        //             conv.IsGroup,
        //             conv.UpdatedTime,
        //             Participant = new ConversationWithTotalUnseen_Participants
        //             {
        //                 Id = part.Id,
        //                 IsDeleted = part.IsDeleted,
        //                 IsModerator = part.IsModerator,
        //                 IsNotifying = part.IsNotifying,
        //                 ContactId = part.ContactId,
        //                 Contact = new ConversationWithTotalUnseen_Participants_Contact
        //                 {
        //                     Id = cust.Id,
        //                     Name = cust.Name,
        //                     Avatar = cust.Avatar
        //                 }
        //             },
        //             Message = mess
        //         }
        //     )
        //     .ToListAsync(cancellationToken);

        //     if (!conversations.Any()) return Enumerable.Empty<ConversationWithTotalUnseen>();

        //     var result =
        //         from conv in conversations
        //         group conv by conv.Id into convGroup
        //         from firstMess in convGroup.Select(q => q.Message)
        //             .Where(q => q != null)
        //             .DistinctBy(q => q.Id)
        //             .OrderByDescending(q => q.CreatedTime)
        //             .DefaultIfEmpty()
        //         from lastMess in convGroup.Select(q => q.Message)
        //             .Where(q => q != null)
        //             .DistinctBy(q => q.Id)
        //             .Where(q => q.ContactId == request.ContactId && q.Status == "seen" && q.SeenTime.HasValue)
        //             .OrderByDescending(q => q.CreatedTime)
        //             .DefaultIfEmpty()
        //         select new ConversationWithTotalUnseen
        //         {
        //             Id = convGroup.Key,
        //             Title = convGroup.Select(q => q.Title).FirstOrDefault(),
        //             Avatar = convGroup.Select(q => q.Avatar).FirstOrDefault(),
        //             IsGroup = convGroup.Select(q => q.IsGroup).FirstOrDefault(),
        //             UpdatedTime = convGroup.Select(q => q.UpdatedTime).FirstOrDefault(),
        //             IsNotifying = convGroup.Select(q => q.Participant).DistinctBy(q => q.Id).Where(q => q.ContactId == request.ContactId).FirstOrDefault().IsNotifying,
        //             Participants = convGroup.Select(q => q.Participant).DistinctBy(q => q.Id).Where(q => q.ContactId != request.ContactId).ToList(),
        //             UnSeenMessages = convGroup.Select(q => q.Message)
        //                 .Where(q => q != null)
        //                 .DistinctBy(q => q.Id)
        //                 .Count(q => q.ContactId != request.ContactId && q.Status == "received"),
        //             LastMessageId = firstMess?.Id,
        //             LastMessage = firstMess?.Content,
        //             LastMessageTime = firstMess?.CreatedTime,
        //             LastMessageContact = firstMess?.ContactId,
        //             LastSeenTime = lastMess?.SeenTime
        //         };
        //     return result.DistinctBy(q => q.Id);
        // }

        public async Task<IEnumerable<object>> Handle(Query request, CancellationToken cancellationToken)
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
                            Id = cust.Id,
                            Name = cust.Name,
                            Avatar = cust.Avatar
                        }
                    },
                    mess
                }
            )
            .ToListAsync(cancellationToken);

            if (!conversations.Any()) return Enumerable.Empty<ConversationWithTotalUnseen>();

            // return conversations;

            var result =
                from conv in conversations
                group conv by conv.Id into convGroup
                let conversation = convGroup.Select(q => q.conv).FirstOrDefault()
                let participants = convGroup.Select(q => q.part).DistinctBy(q => q.Id)
                let unseenMessages = convGroup.Select(q => q.mess)
                    .Where(q => q != null)
                    .DistinctBy(q => q.Id)
                    .Where(q => q.ContactId != request.ContactId && q.Status == "received")
                    .Count()
                let firstMess = convGroup.Select(q => q.mess)
                    .Where(q => q != null)
                    .DistinctBy(q => q.Id)
                    .OrderByDescending(q => q.CreatedTime)
                    .FirstOrDefault()
                let lastMess = convGroup.Select(q => q.mess)
                    .Where(q => q != null)
                    .DistinctBy(q => q.Id)
                    .Where(q => q.ContactId == request.ContactId && q.Status == "seen" && q.SeenTime.HasValue)
                    .OrderByDescending(q => q.CreatedTime)
                    .FirstOrDefault()
                select new ConversationWithTotalUnseen
                {
                    Id = convGroup.Key,
                    Title = conversation.Title,
                    Avatar = conversation.Avatar,
                    IsGroup = conversation.IsGroup,
                    UpdatedTime = conversation.UpdatedTime,
                    IsNotifying = participants.Where(q => q.ContactId == request.ContactId).FirstOrDefault().IsNotifying,
                    Participants = participants.Where(q => q.ContactId != request.ContactId).ToList(),
                    UnSeenMessages = unseenMessages,
                    LastMessageId = firstMess?.Id,
                    LastMessage = firstMess?.Content,
                    LastMessageTime = firstMess?.CreatedTime,
                    LastMessageContact = firstMess?.ContactId,
                    LastSeenTime = lastMess?.SeenTime
                };
            // return result.DistinctBy(q => q.Id);
            return result;
        }

        // public async Task<IEnumerable<object>> Handle(Query request, CancellationToken cancellationToken)
        // {
        //     request.Page = request.Page != 0 ? request.Page : AppConstants.DefaultPage;
        //     request.Limit = request.Limit != 0 ? request.Limit : AppConstants.DefaultLimit;

        //     var conversations = await (
        //         from conv in _dbContext.Set<Conversation>().AsNoTracking()
        //             .Select(q => new { q.Id, q.Title, q.Avatar, q.IsGroup, q.UpdatedTime })
        //             .OrderByDescending(q => q.UpdatedTime)
        //             .Skip(request.Limit * (request.Page - 1))
        //             .Take(request.Limit)
        //         from mess in _dbContext.Set<Message>().AsNoTracking().Where(q => q.ConversationId == conv.Id).DefaultIfEmpty()
        //         join part in _dbContext.Set<Participant>().AsNoTracking() on conv.Id equals part.ConversationId into partGrouping
        //         from part in partGrouping.AsEnumerable()
        //         join cust in _dbContext.Set<Contact>().AsNoTracking() on part.ContactId equals cust.Id
        //         select new
        //         {
        //             conv.Id,
        //             Participants = partGrouping,
        //             cust,
        //             mess
        //         }
        //         // select new { conv, part, cust, mess }
        //     )
        //     .ToListAsync(cancellationToken);

        //     if (!conversations.Any()) return Enumerable.Empty<ConversationWithTotalUnseen>();

        //     return conversations;
        //     // var result =
        //     //     from conv in conversations
        //     //     group conv by new { conv.conv.Id } into convGroup
        //     //     from firstMess in convGroup.Select(q => q.mess)
        //     //         .Where(q => q != null)
        //     //         .DistinctBy(q => q.Id)
        //     //         .OrderByDescending(q => q.CreatedTime)
        //     //         .DefaultIfEmpty()
        //     //     from lastMess in convGroup.Select(q => q.mess)
        //     //         .Where(q => q != null)
        //     //         .DistinctBy(q => q.Id)
        //     //         .Where(q => q.ContactId == request.ContactId && q.Status == "seen" && q.SeenTime.HasValue)
        //     //         .OrderByDescending(q => q.CreatedTime)
        //     //         .DefaultIfEmpty()
        //     //     select new ConversationWithTotalUnseen
        //     //     {
        //     //         Id = convGroup.Key,
        //     //         Title = convGroup.Select(q => q.conv.Title).FirstOrDefault(),
        //     //         Avatar = convGroup.Select(q => q.conv.Avatar).FirstOrDefault(),
        //     //         IsGroup = convGroup.Select(q => q.conv.IsGroup).FirstOrDefault(),
        //     //         UpdatedTime = convGroup.Select(q => q.conv.UpdatedTime).FirstOrDefault(),
        //     //         IsNotifying = convGroup.Select(q => q.part).DistinctBy(q => q.Id).Where(q => q.ContactId == request.ContactId).FirstOrDefault().IsNotifying,
        //     //         Participants = convGroup
        //     //             .Select(q => new ConversationWithTotalUnseen_Participants
        //     //             {
        //     //                 Id = q.part.Id,
        //     //                 IsDeleted = q.part.IsDeleted,
        //     //                 IsModerator = q.part.IsModerator,
        //     //                 IsNotifying = q.part.IsNotifying,
        //     //                 ContactId = q.part.ContactId,
        //     //                 Contact = new ConversationWithTotalUnseen_Participants_Contact
        //     //                 {
        //     //                     Id = convGroup.Select(q => q.cust).FirstOrDefault().Id,
        //     //                     Name = convGroup.Select(q => q.cust).FirstOrDefault().Name,
        //     //                     Avatar = convGroup.Select(q => q.cust).FirstOrDefault().Avatar,
        //     //                 }
        //     //             })
        //     //             .DistinctBy(q => q.Id)
        //     //             .Where(q => q.ContactId != request.ContactId)
        //     //             .ToList(),
        //     //         UnSeenMessages = convGroup.Select(q => q.mess)
        //     //             .Where(q => q != null)
        //     //             .DistinctBy(q => q.Id)
        //     //             .Count(q => q.ContactId != request.ContactId && q.Status == "received"),
        //     //         LastMessageId = firstMess?.Id,
        //     //         LastMessage = firstMess?.Content,
        //     //         LastMessageTime = firstMess?.CreatedTime,
        //     //         LastMessageContact = firstMess?.ContactId,
        //     //         LastSeenTime = lastMess?.SeenTime
        //     //     };
        //     // return result.DistinctBy(q => q.Id);
        //}
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
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}