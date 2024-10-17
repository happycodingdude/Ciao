namespace Shared.Constants;

public partial class AppConstants
{
    public class JsonSerialization
    {
        public static readonly JsonSerializerOptions SerializeOptions = new(JsonSerializerDefaults.Web)
        {
            WriteIndented = true
        };
    }
}