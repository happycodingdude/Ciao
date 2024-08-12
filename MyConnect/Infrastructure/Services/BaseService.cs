namespace Infrastructure.Services;

public class BaseService<T, V>(IRepository<T> repository, IUnitOfWork unitOfWork, IMapper mapper) : IBaseService<T, V> where T : BaseModel where V : class
{
    public virtual IEnumerable<V> GetAll()
    {
        var entity = repository.GetAll();
        return mapper.Map<IEnumerable<T>, IEnumerable<V>>(entity);
    }

    public virtual IEnumerable<V> GetAll(int page, int limit)
    {
        var entity = repository.GetAll(page, limit);
        return mapper.Map<IEnumerable<T>, IEnumerable<V>>(entity);
    }

    public virtual async Task<V> GetByIdAsync(Guid id)
    {
        var entity = await repository.GetByIdAsync(id);
        return mapper.Map<T, V>(entity);
    }

    public virtual async Task<V> AddAsync(V dto)
    {
        var entity = mapper.Map<V, T>(dto);
        repository.Add(entity);
        await unitOfWork.SaveAsync();
        return mapper.Map<T, V>(entity);
    }

    public virtual async Task<List<V>> AddAsync(List<V> dto)
    {
        var entity = mapper.Map<List<V>, List<T>>(dto);
        repository.Add(entity);
        await unitOfWork.SaveAsync();
        return mapper.Map<List<T>, List<V>>(entity);
    }

    public virtual async Task<V> UpdateAsync(V dto)
    {
        var entity = mapper.Map<V, T>(dto);
        // entity.BeforeUpdate();
        repository.Update(entity);
        await unitOfWork.SaveAsync();
        return mapper.Map<T, V>(entity);
    }

    public virtual async Task<V> PatchAsync(Guid id, JsonPatchDocument patch)
    {
        // if (!patch.Operations.Any()) return null;
        var entity = await repository.GetByIdAsync(id);
        patch.ApplyTo(entity);
        repository.Update(entity);
        await unitOfWork.SaveAsync();
        return mapper.Map<T, V>(entity);
    }

    public async Task<List<PatchResponse>> BulkUpdateAsync(List<PatchRequest<V>> patches)
    {
        var response = new List<PatchResponse>();
        foreach (var patch in patches)
        {
            var entity = await repository.GetByIdAsync(patch.Id);
            if (entity == null)
            {
                response.Add(new PatchResponse(entity.Id, "object not found"));
            }
            else
            {
                var dto = mapper.Map<T, V>(entity);
                patch.PatchDocument.ApplyTo(dto);
                var updatedEntity = mapper.Map<V, T>(dto);
                repository.Update(updatedEntity);
                response.Add(new PatchResponse(updatedEntity.Id, "success"));
            }
        }
        await unitOfWork.SaveAsync();
        return response;
    }

    public virtual async Task DeleteAsync(Guid id)
    {
        repository.Delete(id);
        await unitOfWork.SaveAsync();
    }

    public virtual async Task DeleteAsync(List<V> dto)
    {
        var entity = mapper.Map<List<V>, List<T>>(dto);
        repository.Delete(entity);
        await unitOfWork.SaveAsync();
    }
}