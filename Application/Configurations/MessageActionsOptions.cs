namespace Application.Configurations;

// TTL cho edit / recall — configurable qua appsettings ("MessageActions"), enforce server-side.
// Edit và recall có TTL riêng để tinh chỉnh độc lập (vd nới edit dài hơn recall về sau).
public class MessageActionsOptions
{
    public const string SectionName = "MessageActions";

    public int EditTtlMinutes { get; set; } = 15;
    public int RecallTtlMinutes { get; set; } = 15;
}
