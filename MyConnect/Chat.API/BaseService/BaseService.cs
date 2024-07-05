namespace Chat.API.BaseService;

public class BaseService<T, V> : IBaseService<T, V> where T : BaseModel where V : class
{
    private readonly IRepository<T> _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public BaseService(IRepository<T> repository, IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _repository = repository;
    }

    public virtual IEnumerable<V> GetAll()
    {
        var entity = _repository.GetAll();
        return _mapper.Map<IEnumerable<T>, IEnumerable<V>>(entity);
    }

    public virtual IEnumerable<V> GetAll(int page, int limit)
    {
        var entity = _repository.GetAll(page, limit);
        return _mapper.Map<IEnumerable<T>, IEnumerable<V>>(entity);
    }

    public virtual async Task<V> GetByIdAsync(Guid id)
    {
        var entity = await _repository.GetByIdAsync(id);
        return _mapper.Map<T, V>(entity);
    }

    public virtual async Task<V> AddAsync(V dto)
    {
        var entity = _mapper.Map<V, T>(dto);
        _repository.Add(entity);
        await _unitOfWork.SaveAsync();
        return _mapper.Map<T, V>(entity);
    }

    public virtual async Task<List<V>> AddAsync(List<V> dto)
    {
        var entity = _mapper.Map<List<V>, List<T>>(dto);
        _repository.Add(entity);
        await _unitOfWork.SaveAsync();
        return _mapper.Map<List<T>, List<V>>(entity);
    }

    public virtual async Task<V> UpdateAsync(V dto)
    {
        var entity = _mapper.Map<V, T>(dto);
        // entity.BeforeUpdate();
        _repository.Update(entity);
        await _unitOfWork.SaveAsync();
        return _mapper.Map<T, V>(entity);
    }

    public virtual async Task<V> PatchAsync(Guid id, JsonPatchDocument patch)
    {
        var entity = await _repository.GetByIdAsync(id);
        patch.ApplyTo(entity);
        // entity.BeforeUpdate();
        _repository.Update(entity);
        await _unitOfWork.SaveAsync();
        return _mapper.Map<T, V>(entity);
    }

    public async Task<List<PatchResponse>> BulkUpdateAsync(List<PatchRequest<V>> patches)
    {
        var response = new List<PatchResponse>();
        foreach (var patch in patches)
        {
            var entity = await _repository.GetByIdAsync(patch.Id);
            if (entity == null)
            {
                response.Add(new PatchResponse(entity.Id, "object not found"));
            }
            else
            {
                var dto = _mapper.Map<T, V>(entity);
                patch.PatchDocument.ApplyTo(dto);
                var updatedEntity = _mapper.Map<V, T>(dto);
                _repository.Update(updatedEntity);
                response.Add(new PatchResponse(updatedEntity.Id, "success"));
            }
        }
        await _unitOfWork.SaveAsync();
        return response;
    }

    public virtual async Task DeleteAsync(Guid id)
    {
        _repository.Delete(id);
        await _unitOfWork.SaveAsync();
    }

    public virtual async Task DeleteAsync(List<V> dto)
    {
        var entity = _mapper.Map<List<V>, List<T>>(dto);
        _repository.Delete(entity);
        await _unitOfWork.SaveAsync();
    }
}