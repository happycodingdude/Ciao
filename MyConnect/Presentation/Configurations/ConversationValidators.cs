namespace Presentation.Configurations;

public static class ConversationValidators
{
    public static IRuleBuilderOptions<T, string> ContactRelatedToConversation<T>(this IRuleBuilder<T, string> ruleBuilder,
        IContactRepository contactRepository,
        IConversationRepository conversationRepository)
    {
        return ruleBuilder.MustAsync(async (id, cancellation) =>
        {
            var user = await contactRepository.GetInfoAsync();
            var conversation = await conversationRepository.GetItemAsync(MongoQuery<Conversation>.IdFilter(id));
            Console.WriteLine($"conversation => {conversation}");
            return conversation != null && conversation.Participants.Any(q => q.Contact.Id == user.Id);
        }).WithMessage("Not related to this conversation");
    }
}