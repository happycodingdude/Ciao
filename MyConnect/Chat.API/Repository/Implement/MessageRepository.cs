namespace Chat.API.Repository
{
    public class MessageRepository : BaseRepository<Message>, IMessageRepository
    {
        public MessageRepository(CoreContext context) : base(context) { }
    }
}