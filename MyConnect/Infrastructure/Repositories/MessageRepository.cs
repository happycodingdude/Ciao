namespace Infrastructure.Repositories;

public class MessageRepository(AppDbContext context) : BaseRepository<Message>(context), IMessageRepository { }