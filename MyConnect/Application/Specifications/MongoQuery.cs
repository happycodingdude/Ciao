namespace Application.Specifications;

public static class MongoQuery
{
    public static FilterDefinition<T> IdFilter<T>(string id) where T : MongoBaseModel
    {
        return Builders<T>.Filter.Eq(q => q.Id, id);
    }
}