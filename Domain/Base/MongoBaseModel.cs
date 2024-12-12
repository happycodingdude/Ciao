namespace Domain.Base;

public class MongoBaseModel
{
    [BsonId]
    public string Id { get; set; }
    [BsonElement("CreatedTime")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Local)]
    public DateTime CreatedTime { get; set; } = DateTime.Now;
    [BsonElement("UpdatedTime")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Local)]
    public DateTime? UpdatedTime { get; set; }

    public MongoBaseModel()
    {
        Id = ObjectId.GenerateNewId().ToString();
    }
}