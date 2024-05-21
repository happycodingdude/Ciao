namespace Chat.API.Interface;

public interface IBaseService<T, V> where V : class
{
    IEnumerable<V> GetAll();
    IEnumerable<V> GetAll(int page, int limit);
    V GetById(Guid id);
    V Add(V dto);
    List<V> Add(List<V> dto);
    V Update(V dto);
    V Patch(Guid id, JsonPatchDocument patch);
    List<PatchResponse> BulkUpdate(List<PatchRequest<V>> patches);
    void Delete(Guid id);
    void Delete(List<V> dto);
}