namespace Infrastructure.BackgroundJobs;

public class KafkaConsumer
{
    public List<string> _topics { get; private set; }
    public string _groupId { get; private set; }
    // KafkaConsumer _kafkaConsumer = new KafkaConsumer();

    public KafkaConsumer Subscribe(List<string> topics)
    {
        _topics = topics;
        return this;
    }

    public KafkaConsumer UseGroup(string groupId)
    {
        _groupId = groupId;
        return this;
    }

    public KafkaConsumer Build()
    {
        return this;
    }
}
