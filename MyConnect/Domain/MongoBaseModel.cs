namespace Domain.Features;

public class MongoBaseModel
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }
    [BsonElement("CreatedTime")]
    public DateTime CreatedTime { get; set; } = DateTime.Now;
    [BsonElement("UpdatedTime")]
    public DateTime? UpdatedTime { get; set; }

    public void BeforeUpdate()
    {
        UpdatedTime = DateTime.Now;
    }
}