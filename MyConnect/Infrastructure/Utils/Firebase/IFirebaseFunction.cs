namespace Infrastructure.Utils.Firebase;

public interface IFirebaseFunction
{
    Task Notify(FirebaseNotification notification);
}