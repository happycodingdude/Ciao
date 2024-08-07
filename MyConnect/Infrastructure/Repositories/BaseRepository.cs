namespace Infrastructure.Repositories;

public class BaseRepository<T> : IRepository<T> where T : BaseModel
{
    protected readonly AppDbContext _context;
    protected readonly DbSet<T> _dbSet;
    public DbSet<T> DbSet { get; private set; }

    public BaseRepository(AppDbContext context)
    {
        _context = context;
        _context.ChangeTracker.QueryTrackingBehavior = QueryTrackingBehavior.NoTracking;
        _dbSet = _context.Set<T>();
        DbSet = _context.Set<T>();
    }

    public virtual IEnumerable<T> GetAll()
    {
        return DbSet.ToList();
    }

    public virtual IEnumerable<T> GetAll(int page, int limit)
    {
        return DbSet.AsNoTracking().OrderByDescending(q => q.CreatedTime).Skip(limit * (page - 1)).Take(limit).ToList();
    }

    public virtual async Task<T> GetByIdAsync(Guid id)
    {
        return await DbSet.FindAsync(id);
    }

    public virtual void Add(T entity)
    {
        DbSet.Add(entity);
    }

    public virtual void Add(List<T> entities)
    {
        DbSet.AddRange(entities);
    }

    public virtual void Update(T entity)
    {
        entity.BeforeUpdate();
        DbSet.Entry(entity).State = EntityState.Modified;
        DbSet.Entry(entity).Property(q => q.CreatedTime).IsModified = false;
        // DbSet.Update(entity);
        // _context.Entry(entity).State = EntityState.Modified;
        // _context.Entry(entity).Property(q => q.CreatedTime).IsModified = false;
    }

    public virtual void Update(List<T> entity)
    {
        foreach (var item in entity)
        {
            item.BeforeUpdate();
            DbSet.Entry(item).State = EntityState.Modified;
            DbSet.Entry(item).Property(q => q.CreatedTime).IsModified = false;
        }
    }

    public virtual void Delete(Guid id)
    {
        var entity = DbSet.Find(id);
        DbSet.Remove(entity);
    }

    public virtual void Delete(List<T> entities)
    {
        DbSet.RemoveRange(entities);
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