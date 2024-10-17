namespace Application.Specifications;

public static class MongoQuery<T> where T : MongoBaseModel
{
    public static FilterDefinition<T> IdFilter(string id)
    {
        return Builders<T>.Filter.Eq(q => q.Id, id);
    }
    public static FilterDefinition<T> EmptyFilter()
    {
        return Builders<T>.Filter.Empty;
    }
}