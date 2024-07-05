namespace Chat.API.BaseService;

public class PatchResponse
{
    public Guid Id { get; set; }
    public bool Status { get; set; }
    public string Error { get; set; }

    public PatchResponse(Guid id)
    {
        Id = id;
        Status = true;
    }

    public PatchResponse(Guid id, string error)
    {
        Id = id;
        Error = error;
        Status = false;
    }
}