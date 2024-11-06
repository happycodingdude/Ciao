namespace Infrastructure.Repositories;

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

        var pipeline = new[]
        {
            new BsonDocument("$match", new BsonDocument
            {
                { "$expr", new BsonDocument("$and", new BsonArray
                    {
                        new BsonDocument("$or", new BsonArray
                        {
                            new BsonDocument("$eq", new BsonArray { "$FromContact.ContactId", user.Id }),
                            new BsonDocument("$eq", new BsonArray { "$ToContact.ContactId", user.Id })
                        }),
                        new BsonDocument("$ne", new BsonArray { "$AcceptTime", BsonNull.Value })
                    })
                }
            }),
            new BsonDocument("$lookup", new BsonDocument
            {
                { "from", "Contact" }, // replace with the actual name of the Contact collection
                { "let", new BsonDocument
                    {
                        { "fromId", "$FromContact.ContactId" },
                        { "toId", "$ToContact.ContactId" }
                    }
                },
                { "pipeline", new BsonArray
                    {
                        new BsonDocument("$match", new BsonDocument
                        {
                            { "$expr", new BsonDocument("$or", new BsonArray
                                {
                                    new BsonDocument("$eq", new BsonArray { "$_id", "$$fromId" }),
                                    new BsonDocument("$eq", new BsonArray { "$_id", "$$toId" })
                                })
                            }
                        }),
                        new BsonDocument("$project", new BsonDocument
                        {
                            { "Name", 1 },
                            { "Avatar", 1 },
                            { "ContactId", 1 }
                        })
                    }
                },
                { "as", "ContactDetails" }
            }),
            new BsonDocument("$addFields", new BsonDocument
            {
                { "Contact", new BsonDocument("$filter", new BsonDocument
                    {
                        { "input", "$ContactDetails" },
                        { "as", "contact" },
                        { "cond", new BsonDocument("$ne", new BsonArray { "$$contact._id", user.Id }) }
                    })
                }
            }),
            new BsonDocument("$addFields", new BsonDocument
            {
                { "Contact", new BsonDocument("$arrayElemAt", new BsonArray { "$Contact", 0 }) }
            }),
            new BsonDocument("$project", new BsonDocument
            {
                { "ContactDetails", 0 },
                { "FromContact", 0 },
                { "ToContact", 0 },
                { "CreatedTime", 0 },
                { "UpdatedTime", 0 },
                { "AcceptTime", 0 }
            })
        };

        var friends = (await _collection
            .Aggregate<BsonDocument>(pipeline)
            .ToListAsync())
            .Select(bson => BsonSerializer.Deserialize<GetListFriendItem>(bson));

        return friends;
    }
}