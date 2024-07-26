namespace Infrastructure.Utils.Firebase;

public class FirebaseNotification
{
    public string _event { get; set; }
    public string[] tokens { get; set; }
    public string title { get; set; } = "MyConnect notify";
    public string body { get; set; } = "MyConnect notify";
    public object? data { get; set; }
}