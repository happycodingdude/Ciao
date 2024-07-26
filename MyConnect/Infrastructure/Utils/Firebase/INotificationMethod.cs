namespace Infrastructure.Utils.Firebase;

public interface INotificationMethod
{
    Task Notify(string _event, string[] contactIds, object data);
}