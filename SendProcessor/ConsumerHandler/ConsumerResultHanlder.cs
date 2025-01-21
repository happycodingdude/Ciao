namespace SendProcessor.ConsumerHandler;

/// <summary>
/// Description: Lớp này xử lý message từ Kafka
/// </summary>
public class ConsumerResultHanlder
{
    public static async Task ExecuteAsync(ConsumerResultData data)
    {
        // Commit message
        data.consumer.Commit(data.cr);

        Console.WriteLine($"topic [{data.cr.Topic}] data: {data.cr.Message.Value}");

        switch (data.cr.Topic)
        {
            default:
                break;
        }
    }
}
