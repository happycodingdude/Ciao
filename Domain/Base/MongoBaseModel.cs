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
    public DateTime CreatedTime { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedTime { get; set; }
}
