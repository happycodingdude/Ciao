namespace Application.BackgroundJobs;

public interface IGenericConsumer
{
    Task ProcessMessageAsync(ConsumerResultData param, CancellationToken cancellationToken = default);
}
