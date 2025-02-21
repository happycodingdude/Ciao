namespace Application.Notifications;

public interface ISignalHub
{
    Task Notify(string _event, string[] contactIds, object data);
}