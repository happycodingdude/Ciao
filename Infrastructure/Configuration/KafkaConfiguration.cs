namespace Infrastructure.Configurations;

public class KafkaConfiguration
{
    public string BootstrapServers { get; set; } = string.Empty;
    public string GroupId { get; set; } = string.Empty;
    public int ProduceTimeOut { get; set; }
    public int ConsumeTimeOut { get; set; }
    public int MaxDegreeParallelism { get; set; }
}
