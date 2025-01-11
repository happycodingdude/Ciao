namespace Application.Caching;

/// <summary>
/// Description: Lớp này khai báo các hàm cập nhật giá trị cache
/// </summary>
public interface ICaching
{
    Task UpdateConversation(IEnumerable<ConversationWithTotalUnseen> conversations);
    Task AddNewConversation(ConversationWithTotalUnseen conversation);
    Task AddNewMessage(string conversationId, MessageWithReactions message);
    Task AddNewParticipant(string conversationId, List<ParticipantWithFriendRequest> participants);
}