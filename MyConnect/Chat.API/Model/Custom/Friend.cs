using Chat.API.Repository;

namespace Chat.API.Model
{
    public class FriendDto : BaseModel
    {
        public Guid ContactId1 { get; set; }
        public Guid ContactId2 { get; set; }
        public string? Status { get; set; }
        public DateTime? AcceptTime { get; set; }
        public Contact? Contact1 { get; set; }
        public Contact? Contact2 { get; set; }
    }

    public class GetAllFriend
    {
        public Guid Id { get; set; }
        public Guid ContactId { get; set; }
        public string ContactName { get; set; }
    }

    public class FriendToNotify
    {
        public Guid? RequestId { get; set; }
        public Guid? ContactId { get; set; } // Support client to refetch friend request when cancel request
    }
}