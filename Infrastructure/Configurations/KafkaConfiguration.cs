namespace Infrastructure.Configurations;

public class KafkaConfiguration
{
    public string BootstrapServers { get; set; } = null!;
    public string GroupId { get; set; } = null!;
    public int ProduceTimeOut { get; set; }
    public int ConsumeTimeOut { get; set; }
    public int MaxDegreeParallelism { get; set; }
}
