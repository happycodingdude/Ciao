namespace Chat.API.BaseService;

public interface IBaseService<T, V> where V : class
{
    IEnumerable<V> GetAll();
    IEnumerable<V> GetAll(int page, int limit);
    Task<V> GetByIdAsync(Guid id);
    Task<V> AddAsync(V dto);
    Task<List<V>> AddAsync(List<V> dto);
    Task<V> UpdateAsync(V dto);
    Task<V> PatchAsync(Guid id, JsonPatchDocument patch);
    Task<List<PatchResponse>> BulkUpdateAsync(List<PatchRequest<V>> patches);
    Task DeleteAsync(Guid id);
    Task DeleteAsync(List<V> dto);
}