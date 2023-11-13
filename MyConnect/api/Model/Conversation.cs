using System;
namespace MyConnect.Model
{
    public class Conversation : BaseModel
    {
        public string? Title { get; set; }
        public DateTime? DeletedTime { get; set; }
        public ICollection<Participants> Participants { get; set; }
        public ICollection<Message> Messages { get; set; }
    }
}