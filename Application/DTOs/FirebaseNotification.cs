namespace Application.DTOs;

public class FirebaseNotification
{
    public string _event { get; set; } = null!;
    public string[] tokens { get; set; } = null!;
    public string title { get; set; } = "Ciao notify";
    public string body { get; set; } = "Ciao notify";
    public object? data { get; set; }
}