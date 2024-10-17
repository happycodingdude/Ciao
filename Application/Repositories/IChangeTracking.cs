namespace Application.Repositories;

public interface IChangeTracking<T>
{
    Task StartTrackingAsync(Func<ChangeStreamDocument<BsonDocument>, CancellationToken, Task> action, CancellationToken cancellationToken);
    void StopTracking();
}