
namespace Infrastructure.Repositories;

public class ConversationRepository : MongoBaseRepository<Conversation>, IConversationRepository
{
    readonly IMapper _mapper;
    readonly IContactRepository _contactRepository;

    public ConversationRepository(MongoDbContext context,
        IUnitOfWork uow,
        IMapper mapper,
        IContactRepository contactRepository)
        : base(context, uow)
    {
        _mapper = mapper;
        _contactRepository = contactRepository;
    }

    public async Task<IEnumerable<ConversationWithTotalUnseen>> GetConversationsWithUnseenMesages(PagingParam pagingParam)
    {
        var userId = _contactRepository.GetUserId();

        var pipeline = new BsonDocument[]
        {
            new BsonDocument("$match", new BsonDocument("Participants", new BsonDocument("$elemMatch",
                new BsonDocument
                {
                    {"Contact._id", userId},
                    {"IsDeleted", false},
                }))),
            new BsonDocument("$unwind", "$Participants"),
            
            // Lookup stage
            new BsonDocument("$lookup", new BsonDocument
            {
                { "from", "Friend" },
                { "let", new BsonDocument("contactId", "$Participants.Contact._id") },  // Define variable contactId from Contact's _id
                { "pipeline", new BsonArray
                    {
                        new BsonDocument("$match", new BsonDocument("$expr",
                            new BsonDocument("$or", new BsonArray
                            {
                                new BsonDocument("$and", new BsonArray
                                {
                                    new BsonDocument("$eq", new BsonArray { "$FromContact.ContactId", "$$contactId" }),
                                    new BsonDocument("$eq", new BsonArray { "$ToContact.ContactId", userId })
                                }),
                                new BsonDocument("$and", new BsonArray
                                {
                                    new BsonDocument("$eq", new BsonArray { "$FromContact.ContactId", userId }),
                                    new BsonDocument("$eq", new BsonArray { "$ToContact.ContactId", "$$contactId" })
                                })
                            })
                        ))
                    }
                },
                { "as", "MatchingFriends" }
            }),
                        
            // group state
            new BsonDocument("$group", new BsonDocument
            {
                { "_id", "$_id" },
                { "Title", new BsonDocument("$first", "$Title") },
                { "Avatar", new BsonDocument("$first", "$Avatar") },
                { "IsGroup", new BsonDocument("$first", "$IsGroup") },
                { "UpdatedTime", new BsonDocument("$first", "$UpdatedTime") },
                { "Messages", new BsonDocument("$first", "$Messages") },
                { "Participants", new BsonDocument("$push", new BsonDocument
                    {
                        { "_id", "$Participants._id" },
                        { "IsDeleted", "$Participants.IsDeleted" },
                        { "IsModerator", "$Participants.IsModerator" },
                        { "IsNotifying", "$Participants.IsNotifying" },
                        { "Contact", "$Participants.Contact" },
                        { "FriendId", new BsonDocument("$first", "$MatchingFriends._id") },
                        { "FriendStatus", new BsonDocument("$cond", new BsonArray
                            {
                                new BsonDocument("$eq", new BsonArray { new BsonDocument("$size", "$MatchingFriends"), 0 }),
                                "new",
                                new BsonDocument("$cond", new BsonArray
                                {
                                    new BsonDocument("$ne", new BsonArray { new BsonDocument("$first", "$MatchingFriends.AcceptTime"), BsonNull.Value }),
                                    "friend",
                                    new BsonDocument("$cond", new BsonArray
                                    {
                                        new BsonDocument("$eq", new BsonArray { new BsonDocument("$first", "$MatchingFriends.FromContact.ContactId"), userId }),
                                        "request_sent",
                                        "request_received"
                                    })
                                })
                            })
                        }
                    })
                },
            }),
            
            // project state
            new BsonDocument("$project", new BsonDocument
            {
                { "Title", 1 },
                { "Avatar", 1 },
                { "IsGroup", 1 },
                { "UpdatedTime", 1 },
                { "Participants", 1 },
                { "Messages", new BsonDocument("$map", new BsonDocument
                    {
                        { "input", "$Messages" }, // Process the collected Messages array
                        { "as", "message" },
                        { "in", new BsonDocument
                            {
                                { "_id", "$$message._id" },
                                { "Type", "$$message.Type" },
                                { "Content", "$$message.Content" },
                                { "Status", "$$message.Status" },
                                { "IsPinned", "$$message.IsPinned" },
                                { "SeenTime", "$$message.SeenTime" },
                                { "ContactId", "$$message.ContactId" },
                                { "Attachments", "$$message.Attachments" },
                                { "CreatedTime", "$$message.CreatedTime" }
                            }
                        }
                    })
                }
            }),

            new BsonDocument("$sort", new BsonDocument("UpdatedTime", -1)),
            new BsonDocument("$skip", pagingParam.Skip),
            new BsonDocument("$limit", pagingParam.Limit)
        };

        var conversations = (await _collection
            .Aggregate<BsonDocument>(pipeline)
            .ToListAsync())
            .Select(bson => BsonSerializer.Deserialize<ConversationWithTotalUnseen>(bson))
            .ToList();
        if (!conversations.Any()) return Enumerable.Empty<ConversationWithTotalUnseen>();

        foreach (var conversation in conversations)
        {
            conversation.IsNotifying = conversation.Participants.SingleOrDefault(q => q.Contact.Id == userId).IsNotifying;
            conversation.UnSeenMessages = conversation.Messages.Where(q => q.ContactId != userId && q.Status == "received").Count();

            var lastMessage = conversation.Messages.OrderByDescending(q => q.CreatedTime).FirstOrDefault();
            if (lastMessage is not null)
            {
                conversation.LastMessageId = lastMessage.Id;
                conversation.LastMessage = lastMessage.Type == "text" ? lastMessage.Content : string.Join(",", lastMessage.Attachments.Select(q => q.MediaName));
                conversation.LastMessageTime = lastMessage.CreatedTime;
                conversation.LastMessageContact = lastMessage.ContactId;
            }
        }

        return conversations;
    }
}