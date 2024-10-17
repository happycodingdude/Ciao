
namespace Infrastructure.Repositories;

public class ConversationRepository : MongoBaseRepository<Conversation>, IConversationRepository
{
    readonly IMapper _mapper;
    readonly IContactRepository _contactRepository;

    public ConversationRepository(MongoDbContext context,
        IUnitOfWork uow,
        IHttpContextAccessor httpContextAccessor,
        IMapper mapper,
        IContactRepository contactRepository)
        : base(context, uow, httpContextAccessor)
    {
        _mapper = mapper;
        _contactRepository = contactRepository;
        // UserWarehouseDB();
    }

    public async Task<GetConversationsWithUnseenMesagesResponse> GetConversationsWithUnseenMesages(PagingParam pagingParam)
    {
        var userId = _contactRepository.GetUserId();

        var pipeline = new BsonDocument[]
        {
            new BsonDocument("$match", new BsonDocument("Participants.Contact._id", new BsonDocument("$eq", userId))),
            new BsonDocument("$sort", new BsonDocument("UpdatedTime", -1)),
            new BsonDocument("$skip", pagingParam.Skip),
            new BsonDocument("$limit", pagingParam.Limit)
        };

        var conversations = (await _collection
            .Aggregate<BsonDocument>(pipeline)
            .ToListAsync())
            .Select(bson => BsonSerializer.Deserialize<Conversation>(bson))
            .ToList();
        if (!conversations.Any()) return new GetConversationsWithUnseenMesagesResponse();

        var result = new List<ConversationWithTotalUnseen>(conversations.Count);
        foreach (var conversation in conversations)
        {
            var convertedConversation = _mapper.Map<Conversation, ConversationWithTotalUnseen>(conversation);
            convertedConversation.IsNotifying = conversation.Participants.SingleOrDefault(q => q.Contact.Id == userId).IsNotifying;
            convertedConversation.UnSeenMessages = conversation.Messages.Where(q => q.ContactId != userId && q.Status == "received").Count();

            var lastMessage = conversation.Messages.OrderByDescending(q => q.CreatedTime).FirstOrDefault();
            if (lastMessage is not null)
            {
                convertedConversation.LastMessageId = lastMessage.Id;
                convertedConversation.LastMessage = lastMessage.Content;
                convertedConversation.LastMessageTime = lastMessage.CreatedTime;
                convertedConversation.LastMessageContact = lastMessage.ContactId;
            }

            result.Add(convertedConversation);
        }

        return new GetConversationsWithUnseenMesagesResponse(result);
    }

    async Task SeenAll(Conversation conversation)
    {
        var user = await _contactRepository.GetInfoAsync();
        // No need to update when all messages were seen
        if (!conversation.Messages.Any(q => q.ContactId != user.Id && q.Status == "received")) return;

        var filter = MongoQuery<Conversation>.IdFilter(conversation.Id);
        foreach (var unseenMessage in conversation.Messages.Where(q => q.ContactId != user.Id && q.Status == "received"))
        {
            unseenMessage.Status = "seen";
            unseenMessage.SeenTime = DateTime.Now;
        }
        var updates = Builders<Conversation>.Update.Set(q => q.Messages, conversation.Messages);
        Update(filter, updates);
    }

    public async Task<ConversationWithMessages> GetById(string id, PagingParam pagingParam)
    {
        // Define aggregation pipeline
        var pipeline = new BsonDocument[]
        {
            new BsonDocument("$match", new BsonDocument("_id", id)),
            // Project to sort and slice the array
            new BsonDocument("$project", new BsonDocument
            {
                { "Title", 1},
                { "Avatar", 1},
                { "IsGroup", 1},
                { "Participants", 1},
                { "Messages", new BsonDocument
                    {
                        { "$slice", new BsonArray
                            {
                                new BsonDocument("$sortArray", new BsonDocument
                                {
                                    { "input", "$Messages" },
                                    { "sortBy", new BsonDocument("CreatedTime", -1) }  // 1 for ascending, -1 for descending
                                }),
                                pagingParam.Skip,  // Skip the specified number of items
                                pagingParam.Limit  // Limit the result to the specified number of items
                            }
                        }
                    }
                },
                { "NextPage", new BsonDocument
                    {
                        { "$slice", new BsonArray
                            {
                                new BsonDocument("$sortArray", new BsonDocument
                                {
                                    { "input", "$Messages" },
                                    { "sortBy", new BsonDocument("CreatedTime", -1) }
                                }),
                                pagingParam.NextSkip,
                                pagingParam.Limit
                            }
                        }
                    }
                }
            })
        };
        var conversation = await _collection.Aggregate<ConversationWithMessages>(pipeline).SingleOrDefaultAsync();
        if (conversation.NextPage.Any()) conversation.NextExist = true;

        return conversation;
    }
}