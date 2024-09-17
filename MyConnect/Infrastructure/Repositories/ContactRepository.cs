using Shared.Constants;

namespace Infrastructure.Repositories;

public class ContactRepository : MongoBaseRepository<Contact>, IContactRepository
{
    readonly MongoDbContext _context;
    readonly IHttpContextAccessor _httpContextAccessor;
    readonly IMapper _mapper;

    public ContactRepository(MongoDbContext context, IHttpContextAccessor httpContextAccessor, IMapper mapper)
        : base(context, httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
        _mapper = mapper;
        UserWarehouseDB();
    }

    public async Task<IEnumerable<ContactDto>> SearchContactsWithFriendStatus(string name)
    {
        if (string.IsNullOrEmpty(name)) return Enumerable.Empty<ContactDto>();

        var userId = _httpContextAccessor.HttpContext?.Items["UserId"]?.ToString();
        var userFilter = Builders<Contact>.Filter.Where(q => q.UserId == userId);
        var user = await GetItemAsync(userFilter);

        // var db = _context.Client.GetDatabase(typeof(Contact).Name);
        // var userCollection = db.GetCollection<Contact>(userId);
        // var contact = await userCollection.Find(_ => true).SingleOrDefaultAsync();

        var filter = Builders<Contact>.Filter.Text(name);
        var contacts = await GetAllAsync(filter);
        contacts = contacts.Where(q => q.Id != user.Id).ToList();

        // var friendDb = _context.Client.GetDatabase(typeof(Friend).Name);
        // var collections = await friendDb.ListCollectionNamesAsync();
        // var collectionNames = await collections.ToListAsync();

        // var pipeline = new List<BsonDocument>();
        // pipeline.Add(new BsonDocument("$match", new BsonDocument("$text", new BsonDocument("$search", name))));
        // foreach (var collection in collectionNames)
        // {
        //     Console.WriteLine($"collection => {collection}");
        //     var lookupStage = new BsonDocument("$lookup", new BsonDocument
        //     {
        //         { "from", $"Friend.66e7dd8d1f2d715036252230" },  // Referencing collection in Database B
        //         { "localField", "_id" },                   // Field in 'users' collection to match
        //         { "foreignField", "ToContact.ContactId" }, // Field in each collection to match
        //         { "as", $"Friends_{collection}" }  // Alias for the output array for each collection
        //     });
        //     pipeline.Add(lookupStage);
        // }
        var pipeline = new BsonDocument[]
        {
            // Stage 1: Full-text search in 'users' collection (Database A)
            new BsonDocument("$match", new BsonDocument("$text", new BsonDocument("$search", name))),

            // Stage 2: Lookup from 'orders' collection in Database B
            new BsonDocument("$lookup", new BsonDocument
            {
                { "from", "Friend" },      // Fully qualified name (Database B)
                { "localField", "_id" },     // Field in users to match
                { "foreignField", "FromContact.ContactId" },// Field in friend to match
                { "as", "Friends" }           // Output array field
            }),

            // Optional: Filter or project fields as needed
            new BsonDocument("$project", new BsonDocument
            {
                { "Name", 1 },
                { "Bio", 1 },
                { "Friends", 1 }
            })
        };

        var collection = _context.Client.GetDatabase(AppConstants.WarehouseDB).GetCollection<Contact>("Contact");
        var results = await collection
            .Aggregate<BsonDocument>(pipeline)
            .ToListAsync();
        var tmp = results.ToJson();
        Console.WriteLine($"tmp => {tmp}");
        // var contacts = await (
        //     from cust in uow.Contact.DbSet.Where(c => c.Id != request.id && c.Name.Contains(request.name))
        //     from frnd in uow.Friend.DbSet
        //         .Where(f => (f.FromContactId == request.id && f.ToContactId == cust.Id) || (f.FromContactId == cust.Id && f.ToContactId == request.id))
        //         .DefaultIfEmpty()
        //     select new { cust.Id, cust.Name, cust.Avatar, cust.Bio, cust.IsOnline, cust.LastLogout, FriendRequest = frnd }
        //    ).ToListAsync(cancellationToken);

        // if (!contacts.Any()) return Enumerable.Empty<ContactDto>();

        // var result =
        //     from cont in contacts
        //     from frnd in contacts.Select(q => q.FriendRequest).DefaultIfEmpty()
        //     select new ContactDto
        //     {
        //         Id = cont.Id,
        //         Name = cont.Name,
        //         Avatar = cont.Avatar,
        //         Bio = cont.Bio,
        //         IsOnline = cont.IsOnline,
        //         LastLogout = cont.LastLogout,
        //         FriendId = frnd?.Id,
        //         FriendStatus = frnd?.AcceptTime.HasValue == true
        //             ? "friend"
        //             : frnd?.FromContactId == request.id
        //                 ? "request_sent"
        //                 : "request_received"
        //     };
        // return result;

        return _mapper.Map<IEnumerable<Contact>, IEnumerable<ContactDto>>(contacts);
    }
}