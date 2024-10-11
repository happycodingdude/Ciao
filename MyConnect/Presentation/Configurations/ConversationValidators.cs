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
            return conversation != null && conversation.Participants.Any(q => q.Contact.Id == user.Id);
        }).WithMessage("Not related to this conversation");
    }
    // public static IRuleBuilderOptions<T, Message> ContactRelatedToConversationWhenSendMessage<T>(this IRuleBuilder<T, Message> ruleBuilder,
    //     IContactRepository contactRepository,
    //     IConversationRepository conversationRepository)
    // {
    //     return ruleBuilder.MustAsync(async (request, cancellation) =>
    //     {
    //         var user = await contactRepository.GetInfoAsync();
    //         // conversationRepository.UseCollection(request.Moderator);
    //         var conversation = await conversationRepository.GetItemAsync(MongoQuery<Conversation>.IdFilter(request.ConversationId));
    //         return conversation != null && conversation.Participants.Any(q => q.Contact.Id == user.Id);
    //     }).WithMessage("Not related to this conversation");
    // }
}