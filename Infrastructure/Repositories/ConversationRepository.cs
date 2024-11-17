
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

            new BsonDocument("$sort", new BsonDocument("UpdatedTime", -1)),
            new BsonDocument("$skip", pagingParam.Skip),
            new BsonDocument("$limit", pagingParam.Limit)
        };

        var conversations = (await _collection
            .Aggregate<BsonDocument>(pipeline)
            .ToListAsync())
            .Select(bson => BsonSerializer.Deserialize<ConversationWithMessagesAndFriendRequest>(bson))
            .ToList();
        if (!conversations.Any()) return Enumerable.Empty<ConversationWithTotalUnseen>();

        var result = new List<ConversationWithTotalUnseen>(conversations.Count);
        foreach (var conversation in conversations)
        {
            var convertedConversation = _mapper.Map<ConversationWithMessagesAndFriendRequest, ConversationWithTotalUnseen>(conversation);
            convertedConversation.IsNotifying = conversation.Participants.SingleOrDefault(q => q.Contact.Id == userId).IsNotifying;
            convertedConversation.UnSeenMessages = conversation.Messages.Where(q => q.ContactId != userId && q.Status == "received").Count();

            var lastMessage = conversation.Messages.OrderByDescending(q => q.CreatedTime).FirstOrDefault();
            if (lastMessage is not null)
            {
                convertedConversation.LastMessageId = lastMessage.Id;
                convertedConversation.LastMessage = lastMessage.Type == "text" ? lastMessage.Content : string.Join(",", lastMessage.Attachments.Select(q => q.MediaName));
                convertedConversation.LastMessageTime = lastMessage.CreatedTime;
                convertedConversation.LastMessageContact = lastMessage.ContactId;
            }

            result.Add(convertedConversation);
        }

        return result;
    }

    public async Task<object> GetById(string id, PagingParam pagingParam)
    {
        return await GetDirectConversation(id, pagingParam);
    }

    // public async Task<object> GetById(string id, PagingParam pagingParam)
    // {
    //     var filter = MongoQuery<Conversation>.IdFilter(id);
    //     var conversation = await GetItemAsync(filter);
    //     if (conversation.IsGroup)
    //     {
    //         return await GetGroupConversation(id, pagingParam);
    //     }
    //     else
    //     {
    //         return await GetDirectConversation(id, pagingParam);
    //     }
    // }

    async Task<ConversationWithMessages> GetDirectConversation(string id, PagingParam pagingParam)
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

        SeenAll(conversation);

        return conversation;
    }

    async Task<ConversationWithMessagesAndFriendRequest> GetGroupConversation(string id, PagingParam pagingParam)
    {
        var userId = _contactRepository.GetUserId();

        // Define aggregation pipeline
        var pipeline = new BsonDocument[]
        {
            new BsonDocument("$match", new BsonDocument("_id", id)),

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
                { "Messages", new BsonDocument("$first", "$Messages") },
                { "Participants", new BsonDocument("$push", new BsonDocument
                    {
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
            
            // Project to sort and slice the array
            new BsonDocument("$project", new BsonDocument
            {
                { "Title", 1},
                { "Avatar", 1},
                { "IsGroup", 1},
                { "Participants", 1},
                { "Messages", new BsonDocument("$slice", new BsonArray
                            {
                                new BsonDocument("$sortArray", new BsonDocument
                                {
                                    { "input", "$Messages" },
                                    { "sortBy", new BsonDocument("CreatedTime", -1) }  // 1 for ascending, -1 for descending
                                }),
                                pagingParam.Skip,  // Skip the specified number of items
                                pagingParam.Limit  // Limit the result to the specified number of items
                            }
                )},
                { "NextPage", new BsonDocument("$slice", new BsonArray
                            {
                                new BsonDocument("$sortArray", new BsonDocument
                                {
                                    { "input", "$Messages" },
                                    { "sortBy", new BsonDocument("CreatedTime", -1) }  // 1 for ascending, -1 for descending
                                }),
                                pagingParam.NextSkip,  // Skip the specified number of items
                                pagingParam.Limit  // Limit the result to the specified number of items
                            }
                )}
            })
        };
        var conversation = await _collection.Aggregate<ConversationWithMessagesAndFriendRequest>(pipeline).SingleOrDefaultAsync();
        if (conversation.NextPage.Any()) conversation.NextExist = true;

        SeenAll(conversation);

        return conversation;
    }

    void SeenAll(ConversationWithNextPage conversation)
    {
        var userId = _contactRepository.GetUserId();
        // No need to update when all messages were seen
        if (!conversation.Messages.Any(q => q.ContactId != userId && q.Status == "received")) return;

        var filter = MongoQuery<Conversation>.IdFilter(conversation.Id);
        foreach (var unseenMessage in conversation.Messages.Where(q => q.ContactId != userId && q.Status == "received"))
        {
            unseenMessage.Status = "seen";
            unseenMessage.SeenTime = DateTime.Now;
        }
        var updates = Builders<Conversation>.Update.Set(q => q.Messages, conversation.Messages);
        UpdateNoTracking(filter, updates);
    }
}