namespace Presentation.Configurations;

public static class FriendValidators
{
    public static IRuleBuilderOptions<T, string> ContactRelatedToFriendRequest<T>(this IRuleBuilder<T, string> ruleBuilder,
        IContactRepository contactRepository,
        IFriendRepository friendRepository)
    {
        return ruleBuilder.MustAsync(async (id, cancellation) =>
        {
            var user = await contactRepository.GetInfoAsync();
            var friendRq = await friendRepository.GetItemAsync(MongoQuery<Friend>.IdFilter(id));
            return friendRq is not null && (friendRq.FromContact.ContactId == user.Id || friendRq.ToContact.ContactId == user.Id);
        }).WithMessage("Not related to this friend request");
    }

    public static IRuleBuilderOptions<T, string> NotYetAccepted<T>(this IRuleBuilder<T, string> ruleBuilder, IFriendRepository friendRepository)
    {
        return ruleBuilder.MustAsync(async (id, cancellation) =>
        {
            var friendRq = await friendRepository.GetItemAsync(MongoQuery<Friend>.IdFilter(id));
            return !friendRq.AcceptTime.HasValue;
        }).WithMessage("Friend request was accepted");
    }
}