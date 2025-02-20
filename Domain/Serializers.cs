namespace Domain;

public class LocalDateTimeSerializer : IBsonSerializer<DateTime>
{
    public Type ValueType => typeof(DateTime);

    object IBsonSerializer.Deserialize(BsonDeserializationContext context, BsonDeserializationArgs args)
    {
        return Deserialize(context, args);
    }

    public DateTime Deserialize(BsonDeserializationContext context, BsonDeserializationArgs args)
    {
        var utcDateTime = context.Reader.ReadDateTime();
        return DateTimeOffset.FromUnixTimeMilliseconds(utcDateTime).UtcDateTime.ToLocalTime();
    }

    void IBsonSerializer.Serialize(BsonSerializationContext context, BsonSerializationArgs args, object value)
    {
        Serialize(context, args, (DateTime)value);
    }

    public void Serialize(BsonSerializationContext context, BsonSerializationArgs args, DateTime value)
    {
        var utcDateTime = DateTime.SpecifyKind(value, DateTimeKind.Local).ToUniversalTime();
        context.Writer.WriteDateTime(((DateTimeOffset)utcDateTime).ToUnixTimeMilliseconds());
    }
}

public class NullableLocalDateTimeSerializer : IBsonSerializer<DateTime?>
{
    public Type ValueType => typeof(DateTime?);

    object IBsonSerializer.Deserialize(BsonDeserializationContext context, BsonDeserializationArgs args)
    {
        return Deserialize(context, args);
    }

    public DateTime? Deserialize(BsonDeserializationContext context, BsonDeserializationArgs args)
    {
        if (context.Reader.CurrentBsonType == BsonType.Null)
        {
            context.Reader.ReadNull();
            return null;
        }

        var utcDateTime = context.Reader.ReadDateTime();
        return DateTimeOffset.FromUnixTimeMilliseconds(utcDateTime).UtcDateTime.ToLocalTime();
    }

    void IBsonSerializer.Serialize(BsonSerializationContext context, BsonSerializationArgs args, object value)
    {
        Serialize(context, args, (DateTime?)value);
    }

    public void Serialize(BsonSerializationContext context, BsonSerializationArgs args, DateTime? value)
    {
        if (!value.HasValue)
        {
            context.Writer.WriteNull();
            return;
        }

        var utcDateTime = DateTime.SpecifyKind(value.Value, DateTimeKind.Local).ToUniversalTime();
        context.Writer.WriteDateTime(((DateTimeOffset)utcDateTime).ToUnixTimeMilliseconds());
    }
}