namespace Presentation.Configurations;

public static class ConversationValidators
{
    public static IRuleBuilderOptions<T, string> ContactRelatedToConversation<T>(this IRuleBuilder<T, string> ruleBuilder,
        IContactRepository contactRepository,
        IConversationRepository conversationRepository)
    {
        return ruleBuilder.MustAsync(async (id, cancellation) =>
        {
            var userId = contactRepository.GetUserId();
            var conversation = await conversationRepository.GetItemAsync(MongoQuery<Conversation>.IdFilter(id));
            // Phase 5 — Đợt 2b: NHÓM yêu cầu member ACTIVE (!IsDeleted) — người đã rời không còn
            // quyền truy cập nội dung. Chat 1-1 giữ nguyên (member IsDeleted = "ẩn hội thoại",
            // vẫn thao tác được để giữ luồng reopen/nhắn lại như cũ).
            return conversation != null && conversation.Members.Any(q =>
                q.ContactId == userId && (!conversation.IsGroup || !q.IsDeleted));
        }).WithMessage("Not related to this conversation");
    }

    // Phase 5 — Đợt 2: chỉ quản trị viên (IsModerator, chưa rời nhóm) của NHÓM mới được
    // quản lý link mời + duyệt yêu cầu tham gia. Gộp membership + quyền vào 1 rule = 1 lần fetch.
    public static IRuleBuilderOptions<T, string> MustBeGroupModerator<T>(this IRuleBuilder<T, string> ruleBuilder,
        IContactRepository contactRepository,
        IConversationRepository conversationRepository)
    {
        return ruleBuilder.MustAsync(async (id, cancellation) =>
        {
            var userId = contactRepository.GetUserId();
            var conversation = await conversationRepository.GetItemAsync(MongoQuery<Conversation>.IdFilter(id));
            var member = conversation?.Members.FirstOrDefault(m => m.ContactId == userId);
            return conversation is not null && conversation.IsGroup
                && member is not null && member.IsModerator && !member.IsDeleted;
        }).WithMessage("Only the group moderator can perform this action");
    }
}