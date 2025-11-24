namespace Infrastructure.Repositories;

public class FriendRepository : MongoBaseRepository<Friend>, IFriendRepository
{
    readonly IContactRepository _contactRepository;

    public FriendRepository(MongoDbContext context,
        IUnitOfWork uow,
        // IService<IContactRepository> contactService),
        IContactRepository contactRepository)
        : base(context, uow)
    {
        // _contactRepository = contactService.Get();
        _contactRepository = contactRepository;
    }

    public async Task<string> GetFriendStatusAsync(Friend friend)
    {
        if (friend.AcceptTime.HasValue) return "friend";
        var user = await _contactRepository.GetInfoAsync();
        if (friend.FromContact.ContactId == user.Id) return "request_sent";
        else return "request_received";
    }

    public async Task<List<FriendCacheModel>> GetFriendItems(string userId)
    {
        var pipeline = new BsonDocument[]
        {
            // 1. Match all relations of user
            new BsonDocument("$match", new BsonDocument("$or", new BsonArray
            {
                new BsonDocument("FromContact.ContactId", userId),
                new BsonDocument("ToContact.ContactId", userId)
            })),

            // 2. Lookup contact of the other person
            new BsonDocument("$lookup", new BsonDocument
            {
                { "from", "Contact" },
                { "let", new BsonDocument("contactId", new BsonDocument("$cond", new BsonArray
                    {
                        new BsonDocument("$eq", new BsonArray { "$FromContact.ContactId", userId }),
                        "$ToContact.ContactId",
                        "$FromContact.ContactId"
                    })) },
                { "pipeline", new BsonArray
                    {
                        new BsonDocument("$match", new BsonDocument("$expr", new BsonDocument("$eq", new BsonArray { "$_id", "$$contactId" })))
                    }
                },
                { "as", "contactInfo" }
            }),
            new BsonDocument("$unwind", "$contactInfo"),

            // 3. Lookup Conversation between user and friend
            new BsonDocument("$lookup", new BsonDocument
            {
                { "from", "Conversation" },
                { "let", new BsonDocument
                    {
                        { "userId", userId },
                        { "friendId", "$contactInfo._id" }
                    }
                },
                { "pipeline", new BsonArray
                    {
                        new BsonDocument("$match", new BsonDocument
                        {
                            { "$expr", new BsonDocument("$and", new BsonArray
                                {
                                    new BsonDocument("$in", new BsonArray
                                    {
                                        "$$userId",
                                        "$Members.ContactId"
                                    }),
                                    new BsonDocument("$in", new BsonArray
                                    {
                                        "$$friendId",
                                        "$Members.ContactId"
                                    })
                                })
                            }
                        })
                    }
                },
                { "as", "Conversations" }
            }),

            // 4. Project output
            new BsonDocument("$project", new BsonDocument
            {
                { "FriendId", "$_id" },
                { "FriendStatus", new BsonDocument("$cond", new BsonArray
                    {
                        new BsonDocument("$ifNull", new BsonArray { "$AcceptTime", false }),
                        "friend",
                        new BsonDocument("$cond", new BsonArray
                            {
                                new BsonDocument("$eq", new BsonArray { "$FromContact.ContactId", userId }),
                                "request_sent",
                                "request_received"
                            }
                        )
                    })
                },
                {
                    "Contact","$contactInfo"
                },
                // Convert Conversations to list<string>
                {
                    "Conversations",
                    new BsonDocument("$map", new BsonDocument
                    {
                        { "input", "$Conversations" },
                        { "as", "c" },
                        { "in", new BsonDocument("$toString", "$$c._id") }
                    })
                },
                // DirectConversation = string or null
                {
                    "DirectConversation",
                    new BsonDocument("$let", new BsonDocument
                    {
                        { "vars", new BsonDocument
                            {
                                { "directList", new BsonDocument("$filter", new BsonDocument
                                    {
                                        { "input", "$Conversations" },
                                        { "as", "c" },
                                        { "cond", new BsonDocument("$eq", new BsonArray { "$$c.IsGroup", false }) }
                                    })
                                }
                            }
                        },
                        { "in",
                            new BsonDocument("$cond", new BsonArray
                            {
                                new BsonDocument("$gt", new BsonArray
                                {
                                    new BsonDocument("$size", "$$directList"),
                                    0
                                }),
                                new BsonDocument("$toString",
                                    new BsonDocument("$arrayElemAt", new BsonArray
                                    {
                                        "$$directList._id",
                                        0
                                    })
                                ),
                                BsonNull.Value
                            })
                        }
                    })
                }
            })
        };

        return await _collection.Aggregate<FriendCacheModel>(pipeline).ToListAsync();
    }
}