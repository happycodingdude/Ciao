namespace Application.Caching;

/// <summary>
/// Description: Lớp này khai báo các hàm cập nhật giá trị cache
/// </summary>
public interface ICaching
{
    Task UpdateConversation(string userId, IEnumerable<ConversationWithTotalUnseen> conversations);
    Task AddNewConversation(string userId, ConversationWithTotalUnseen conversation);
    Task AddNewMessage(string userId, string conversationId, MessageWithReactions message);
    Task AddNewParticipant(string userId, string conversationId, List<ParticipantWithFriendRequest> participants);
}