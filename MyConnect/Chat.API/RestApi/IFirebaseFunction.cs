namespace MyConnect.RestApi
{
    public interface IFirebaseFunction
    {
        Task Notify(object data);
    }
}