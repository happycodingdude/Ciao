namespace Infrastructure.Repositories;

public class ConversationRepository(AppDbContext context) : BaseRepository<Conversation>(context), IConversationRepository { }