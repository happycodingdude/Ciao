namespace Infrastructure.Repositories;

// public class FriendRepository(MongoDbContext context, IUnitOfWork uow, IHttpContextAccessor httpContextAccessor)
//     : MongoBaseRepository<Friend>(context, uow, httpContextAccessor), IFriendRepository
// { }
public class FriendRepository : MongoBaseRepository<Friend>, IFriendRepository
{
    readonly IContactRepository _contactRepository;

    public FriendRepository(MongoDbContext context,
        IUnitOfWork uow,
        IHttpContextAccessor httpContextAccessor,
        IService<IContactRepository> contactService)
        : base(context, uow, httpContextAccessor)
    {
        _contactRepository = contactService.Get();
        // UserWarehouseDB();
    }

    public async Task<string> GetFriendStatusAsync(Friend friend)
    {
        if (friend.AcceptTime.HasValue) return "friend";
        var user = await _contactRepository.GetInfoAsync();
        if (friend.FromContact.ContactId == user.Id) return "request_sent";
        else return "request_received";
    }

    public async Task<IEnumerable<GetListFriendItem>> GetListFriend()
    {
        var user = await _contactRepository.GetInfoAsync();

        var pipeline = new BsonDocument[]
         {
            // Search stage
            new BsonDocument("$match", new BsonDocument("AcceptTime", new BsonDocument("$ne", null))),
            
            // Lookup stage
            new BsonDocument("$lookup", new BsonDocument
            {
                { "from", "Contact" },
                { "let", new BsonDocument("contactId", "$_id") },  // Define variable contactId from Contact's _id
                { "pipeline", new BsonArray
                    {
                        new BsonDocument("$match", new BsonDocument("$expr",
                            new BsonDocument("$or", new BsonArray
                            {
                                new BsonDocument("$and", new BsonArray
                                {
                                    new BsonDocument("$eq", new BsonArray { "$FromContact.ContactId", "$$contactId" }),
                                    new BsonDocument("$eq", new BsonArray { "$ToContact.ContactId", user.Id })
                                }),
                                new BsonDocument("$and", new BsonArray
                                {
                                    new BsonDocument("$eq", new BsonArray { "$FromContact.ContactId", user.Id }),
                                    new BsonDocument("$eq", new BsonArray { "$ToContact.ContactId", "$$contactId" })
                                })
                            })
                        ))
                    }
                },
                { "as", "friends" }
            }),

            // Project
            new BsonDocument("$project", new BsonDocument
            {
                {"Name", 1},
                {"Avatar", 1},
                {"Bio", 1},
                {"IsOnline", 1},
                {"FriendId", new BsonDocument("$first", "$friends._id")},
                {"FriendStatus", new BsonDocument("$cond", new BsonDocument
                    {
                        {"if", new BsonDocument("$eq", new BsonArray
                            {
                                new BsonDocument("$size", "$friends"),
                                0
                            })
                        },
                        {"then","new"},
                        {"else", new BsonDocument("$cond", new BsonDocument
                            {
                                {"if", new BsonDocument("$ne", new BsonArray
                                    {
                                        new BsonDocument("$first", "$friends.AcceptTime"),
                                        BsonNull.Value
                                    })
                                },
                                {"then","friend"},
                                // {"else","xxx"}
                                {"else", new BsonDocument("$cond", new BsonDocument
                                    {
                                        // {"if", new BsonDocument("$eq", new BsonArray
                                        //     {
                                        //         new BsonDocument("$size", new BsonDocument("$filter", new BsonDocument
                                        //         {
                                        //             {"input","$friends"},
                                        //             {"as","friend"},
                                        //             {
                                        //                 "cond", new BsonDocument("$eq", new BsonArray
                                        //                 {
                                        //                     "$$friend.FromContact.ContactId",
                                        //                     user.Id
                                        //                 })
                                        //             }
                                        //         })),
                                        //         1
                                        //     })
                                        // },
                                        {"if", new BsonDocument("$eq", new BsonArray
                                            {
                                                new BsonDocument("$first", "$friends.FromContact.ContactId"),
                                                user.Id
                                            })
                                        },
                                        {"then","request_sent"},
                                        {"else","request_received"}
                                    })
                                }
                            })
                        }
                    })
                }
            })
         };

        var contacts = (await _collection
            .Aggregate<BsonDocument>(pipeline)
            .ToListAsync())
            .Select(bson => BsonSerializer.Deserialize<ContactDto>(bson));
    }
}