using AutoMapper;
using Microsoft.AspNetCore.JsonPatch;
using Chat.API.Interface;
using Chat.API.Model;
using Chat.API.Repository;
using Chat.API.UOW;

namespace Chat.API.Implement
{
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

        public virtual V GetById(Guid id)
        {
            var entity = _repository.GetById(id);
            return _mapper.Map<T, V>(entity);
        }

        public virtual V Add(V dto)
        {
            var entity = _mapper.Map<V, T>(dto);
            _repository.Add(entity);
            _unitOfWork.Save();
            return _mapper.Map<T, V>(entity);
        }

        public virtual List<V> Add(List<V> dto)
        {
            var entity = _mapper.Map<List<V>, List<T>>(dto);
            _repository.Add(entity);
            _unitOfWork.Save();
            return _mapper.Map<List<T>, List<V>>(entity);
        }

        public virtual V Update(V dto)
        {
            var entity = _mapper.Map<V, T>(dto);
            // entity.BeforeUpdate();
            _repository.Update(entity);
            _unitOfWork.Save();
            return _mapper.Map<T, V>(entity);
        }

        public virtual V Patch(Guid id, JsonPatchDocument patch)
        {
            var entity = _repository.GetById(id);
            patch.ApplyTo(entity);
            entity.BeforeUpdate();
            _repository.Update(entity);
            _unitOfWork.Save();
            return _mapper.Map<T, V>(entity);
        }

        public List<PatchResponse> BulkUpdate(List<PatchRequest<V>> patches)
        {
            var response = new List<PatchResponse>();
            foreach (var patch in patches)
            {
                var entity = _repository.GetById(patch.Id);
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
            _unitOfWork.Save();
            return response;
        }

        public virtual void Delete(Guid id)
        {
            _repository.Delete(id);
            _unitOfWork.Save();
        }

        public virtual void Delete(List<V> dto)
        {
            var entity = _mapper.Map<List<V>, List<T>>(dto);
            _repository.Delete(entity);
            _unitOfWork.Save();
        }
    }
}