namespace Presentation.Configurations;

public static class NotificationValidators
{
    public static IRuleBuilderOptions<T, string> ContactRelatedToNotification<T>(this IRuleBuilder<T, string> ruleBuilder,
        IContactRepository contactRepository,
        INotificationRepository notificationRepository)
    {
        return ruleBuilder.MustAsync(async (id, cancellation) =>
        {
            var user = await contactRepository.GetInfoAsync();
            var notification = await notificationRepository.GetItemAsync(MongoQuery<Notification>.IdFilter(id));
            return notification != null && notification.ContactId == user.Id;
        }).WithMessage("Not related to this conversation");
    }
}