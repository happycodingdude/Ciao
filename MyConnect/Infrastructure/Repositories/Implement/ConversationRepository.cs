namespace Infrastructure.Repositories;

public class ConversationRepository : BaseRepository<Conversation>, IConversationRepository
{
    public ConversationRepository(AppDbContext context) : base(context) { }
}