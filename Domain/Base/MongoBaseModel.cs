namespace Domain.Base;

public class BaseIdModel
{
    [BsonId]
    public string Id { get; set; }

    public BaseIdModel()
    {
        Id = ObjectId.GenerateNewId().ToString();
    }
}

public class MongoBaseModel : BaseIdModel
{
    // [BsonElement("CreatedTime")]
    // [BsonDateTimeOptions(Kind = DateTimeKind.Local)]
    [BsonSerializer(typeof(LocalDateTimeSerializer))]
    public DateTime CreatedTime { get; set; } = DateTime.Now;
    // [BsonElement("UpdatedTime")]
    // [BsonDateTimeOptions(Kind = DateTimeKind.Local)]
    [BsonSerializer(typeof(NullableLocalDateTimeSerializer))]
    public DateTime? UpdatedTime { get; set; }
}