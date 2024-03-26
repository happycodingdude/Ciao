using Microsoft.EntityFrameworkCore;
using MyConnect.Model;

namespace MyConnect.Repository
{
    public class BaseRepository<T> : IRepository<T> where T : BaseModel
    {
        protected readonly CoreContext _context;
        protected readonly DbSet<T> _dbSet;

        public BaseRepository(CoreContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        public virtual IEnumerable<T> GetAll()
        {
            return _context.Set<T>().ToList();
        }

        public virtual IEnumerable<T> GetAll(int page, int limit)
        {
            return _context.Set<T>().Skip(limit * (page - 1)).Take(limit).ToList();
        }

        public virtual T GetById(Guid id)
        {
            return _context.Set<T>().Find(id);
        }

        public virtual void Add(T entity)
        {
            _context.Set<T>().Add(entity);
        }

        public virtual void AddRange(List<T> entities)
        {
            _context.Set<T>().AddRange(entities);
        }

        public virtual void Update(T entity)
        {
            _context.Entry(entity).State = EntityState.Modified;
            _context.Entry(entity).Property(q => q.CreatedTime).IsModified = false;
            entity.BeforeUpdate();
        }

        public virtual void Delete(Guid id)
        {
            var entity = _context.Set<T>().Find(id);
            _context.Set<T>().Remove(entity);
        }

        private bool disposed = false;

        protected virtual void Dispose(bool disposing)
        {
            if (!disposed)
            {
                if (disposing)
                {
                    _context.Dispose();
                }
            }
            disposed = true;
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }
    }
}