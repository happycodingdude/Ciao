namespace Application.Caching;

/// <summary>
/// Description: Lớp này khai báo các hàm cập nhật giá trị cache
/// </summary>
public interface ICaching
{
    // Task UpdateToken(string userId, string token);
    // Task UpdateNotiConnection(string userId, string connection);
    // Task UpdateUserInfo(Contact user);
    Task UpdateConversation(string userId, List<ConversationWithTotalUnseen> conversations);
    Task AddNewConversation(string userId, ConversationCacheModel conversation);
    Task AddNewConversation(string userId, ConversationCacheModel conversation, MessageWithReactions message);
    Task AddNewMessage(string userId, string conversationId, MessageWithReactions message);
    Task AddNewParticipant(string userId, string conversationId, List<ParticipantWithFriendRequest> participants);
    Task<List<ConversationCacheModel>> GetConversations(string userId);
    Task<List<MessageWithReactions>> GetMessages(string conversationId);
}