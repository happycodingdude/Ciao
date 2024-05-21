namespace Chat.API.Repository;

public class Friend : BaseModel
{
    public Guid ContactId1 { get; set; }
    public Guid ContactId2 { get; set; }
    public string? Status { get; set; }
    public DateTime? AcceptTime { get; set; }
    public Contact? Contact1 { get; set; }
    public Contact? Contact2 { get; set; }
}