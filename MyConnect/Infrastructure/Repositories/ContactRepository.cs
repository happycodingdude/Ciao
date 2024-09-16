namespace Infrastructure.Repositories;

public class ContactRepository(MongoDbContext context, IHttpContextAccessor httpContextAccessor)
    : MongoBaseRepository<Contact>(context, httpContextAccessor), IContactRepository
{
    public async Task<IEnumerable<Contact>> SearchContactsWithFriendStatus(string name)
    {
        if (string.IsNullOrEmpty(name)) return Enumerable.Empty<Contact>();

        var collection = context.Client.GetDatabase(typeof(Contact).Name).GetCollection<Contact>("All");
        // var options = RegexOptions.CultureInvariant | RegexOptions.IgnoreCase;
        // var regex = new Regex(@"(?<!\S)" + name + @"(?!\S)", options);
        // var regex = new Regex(@"[iíìỉĩị]" + name, options);
        // var filter = Builders<Contact>.Filter.Where(q => q.Name.ToLower().Contains(name.ToLower()));
        var filter = Builders<Contact>.Filter.Text(name);
        var contacts = await collection.Find(filter).ToListAsync();

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

        return contacts;
    }
}