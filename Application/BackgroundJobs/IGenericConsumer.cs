namespace Application.BackgroundJobs;

public interface IGenericConsumer
{
    Task ProcessMesageAsync(ConsumerResultData param);
}
