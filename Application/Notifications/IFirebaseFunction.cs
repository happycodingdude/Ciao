namespace Application.Notifications;

public interface IFirebaseFunction
{
    Task Notify(string _event, string[] contactIds, object data);
    Task<Google.Apis.Storage.v1.Data.Object> UploadAsync(UploadModel model);
}