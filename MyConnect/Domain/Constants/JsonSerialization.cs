namespace Domain.Constants;

public partial class Constants
{
    public class JsonSerialization
    {
        public static readonly JsonSerializerOptions SerializeOptions = new(JsonSerializerDefaults.Web)
        {
            WriteIndented = true
        };
    }
}