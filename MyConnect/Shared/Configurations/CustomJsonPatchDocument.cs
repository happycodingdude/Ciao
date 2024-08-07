
namespace Shared.Configurations;

public class CustomJsonPatchDocument
{
    public string op { get; set; }
    public string path { get; set; }
    public string value { get; set; }

    public CustomJsonPatchDocument(string op, string path, string value)
    {
        this.op = op;
        this.path = path;
        this.value = value;
    }
}