namespace Infrastructure.Repositories;

public class ContactRepository : MongoBaseRepository<Contact>, IContactRepository
{
    readonly IHttpContextAccessor _httpContextAccessor;

    public ContactRepository(MongoDbContext context,
        IUnitOfWork uow,
        IHttpContextAccessor httpContextAccessor)
        : base(context, uow)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<Contact> GetByUsername(string username)
    {
        var filter = Builders<Contact>.Filter.Where(q => q.Username == username);
        return await GetItemAsync(filter);
    }

    public string GetUserId()
    {
        return _httpContextAccessor.HttpContext.Items["UserId"].ToString();
    }

    public async Task<Contact> GetInfoAsync(string userId)
    {
        var filter = MongoQuery<Contact>.IdFilter(userId);
        return await GetItemAsync(filter);
    }

    public async Task<Contact> GetInfoAsync()
    {
        var userId = _httpContextAccessor.HttpContext.Items["UserId"].ToString();
        var filter = MongoQuery<Contact>.IdFilter(userId);
        return await GetItemAsync(filter);
    }

    public async Task<IEnumerable<ContactDto>> SearchContactsWithFriendStatus(string name)
    {
        if (string.IsNullOrEmpty(name)) return Enumerable.Empty<ContactDto>();

        var user = await GetInfoAsync();

        var pipeline = new BsonDocument[]
        {
            // Search stage
            new BsonDocument("$match", new BsonDocument("$text", new BsonDocument("$search", name))),
            new BsonDocument("$match", new BsonDocument("_id", new BsonDocument("$ne", user.Id))),
            
            // Lookup stage
            new BsonDocument("$lookup", new BsonDocument
            {
                { "from", "Friend" },
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

        if (!contacts.Any()) return Enumerable.Empty<ContactDto>();

        return contacts;
    }
}