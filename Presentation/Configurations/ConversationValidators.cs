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
            return conversation != null && conversation.Members.Any(q => q.ContactId == userId);
        }).WithMessage("Not related to this conversation");
    }
}