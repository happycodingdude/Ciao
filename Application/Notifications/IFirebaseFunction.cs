namespace Application.Notifications;

public interface IFirebaseFunction
{
    Task Notify(string _event, string[] contactIds, object data);
    Task<string> UploadAsync(UploadModel model);
}