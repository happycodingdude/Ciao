namespace Chat.API.Features.Notifications;

public interface IFirebaseFunction
{
    Task Notify(object data);
}