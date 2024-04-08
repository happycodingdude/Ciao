namespace MyConnect.Repository
{
    public class ConversationRepository : BaseRepository<Conversation>, IConversationRepository
    {
        public ConversationRepository(CoreContext context) : base(context) { }
    }
}