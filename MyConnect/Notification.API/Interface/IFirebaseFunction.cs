namespace Notification.API;

public interface IFirebaseFunction
{
    Task Notify(object data);
}