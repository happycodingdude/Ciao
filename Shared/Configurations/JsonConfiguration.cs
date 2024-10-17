namespace Shared.Configurations;

public class IgnoreJsonAttributesResolver : Newtonsoft.Json.Serialization.DefaultContractResolver
{
    protected override IList<Newtonsoft.Json.Serialization.JsonProperty> CreateProperties(Type type, Newtonsoft.Json.MemberSerialization memberSerialization)
    {
        IList<Newtonsoft.Json.Serialization.JsonProperty> props = base.CreateProperties(type, memberSerialization);
        foreach (var prop in props)
        {
            prop.Ignored = false;   // Ignore [JsonIgnore]
            prop.Converter = null;  // Ignore [JsonConverter]
            prop.PropertyName = prop.UnderlyingName;  // restore original property name
        }
        return props;
    }
}