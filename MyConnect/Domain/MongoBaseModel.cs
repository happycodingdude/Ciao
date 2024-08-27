namespace Domain.Features;

public class MongoBaseModel
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }
    [BsonElement("CreatedTime")]
    public string CreatedTime { get; set; }
    [BsonElement("UpdatedTime")]
    public string UpdatedTime { get; set; }
}