using Microsoft.EntityFrameworkCore;

namespace MyConnect.Repository
{
    public class BaseRepository<T> : IRepository<T> where T : class
    {
        private readonly CoreContext _context;

        public BaseRepository(CoreContext context)
        {
            _context = context;
        }

        public virtual IEnumerable<T> GetAll()
        {
            return _context.Set<T>().ToList();
        }

        public virtual T GetById(Guid id)
        {
            return _context.Set<T>().Find(id);
        }

        public virtual void Add(T entity)
        {
            _context.Set<T>().Add(entity);
        }

        public virtual void Update(T entity)
        {
            _context.Entry(entity).State = EntityState.Modified;
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