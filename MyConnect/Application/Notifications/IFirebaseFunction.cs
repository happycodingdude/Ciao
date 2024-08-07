using Application.DTOs;

namespace Application.Notifications;

public interface IFirebaseFunction
{
    Task Notify(FirebaseNotification notification);
}