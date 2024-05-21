namespace Chat.API.RestApi;

public interface IFirebaseFunction
{
    Task Notify(object data);
}