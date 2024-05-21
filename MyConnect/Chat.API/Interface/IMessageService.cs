namespace Chat.API.Interface;

public interface IMessageService : IBaseService<Message, MessageDto>
{
    Task<MessageDto> SaveAndNotifyMessage(MessageDto model);
    IEnumerable<MessageNoReference> GetByConversationIdWithPaging(Guid id, int page, int limit);
}