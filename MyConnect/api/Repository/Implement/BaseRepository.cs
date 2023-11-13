using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using MyConnect.Model;
using MyConnect.Common;

namespace MyConnect.Repository
{
    public class BaseRepository<T> : IRepository<T> where T : BaseModel
    {
        protected readonly IConfiguration _configuration;
        private readonly CoreContext _context;


        public BaseRepository(CoreContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public virtual async Task<List<T>> GetAll(PagingParam? param = null)
        {
            IQueryable<T> query = _context.Set<T>().AsNoTracking();

            // Join
            if (param?.Includes.Any() == true)
                foreach (var include in param.Includes)
                    query = query.Include(include.TableName);

            // Where
            if (param?.Searchs.Any() == true)
            {
                Expression<Func<T, bool>>? combinedExpression = null;
                var parameter = Expression.Parameter(typeof(T));
                foreach (var search in param.Searchs)
                {
                    var property = typeof(T).GetProperty(search.FieldName);
                    var propertyType = property.PropertyType;
                    var fieldValue = Convert.ChangeType(search.FieldValue, propertyType);

                    var expression =
                    Expression.Lambda<Func<T, bool>>(
                        Expression.Equal(
                            Expression.Property(parameter, property),
                            Expression.Constant(fieldValue, propertyType)
                        ),
                        parameter
                    );

                    if (combinedExpression == null)
                    {
                        combinedExpression = expression;
                    }
                    else
                    {
                        var conditionBody = new ExpressionReplacer(parameter, combinedExpression.Parameters[0]).Visit(expression.Body);
                        BinaryExpression combinedBody;
                        if (search.Operator.Equals("and"))
                            combinedBody = Expression.AndAlso(combinedExpression.Body, conditionBody);
                        else
                            combinedBody = Expression.OrElse(combinedExpression.Body, conditionBody);
                        combinedExpression = Expression.Lambda<Func<T, bool>>(combinedBody, parameter);
                    }
                }
                query = query.Where(combinedExpression);
            }

            // Sort
            if (param?.Sorts.Any() == true)
                foreach (var sort in param.Sorts)
                    query = query.OrderBy(sort.FieldName, sort.SortType.ToLower().Equals("asc"));

            // Execute
            return await query.ToListAsync();
        }

        public virtual async Task<T> GetById(int id, PagingParam? param = null)
        {
            var current = await _context.Set<T>().FindAsync(id);

            if (param?.Includes.Any() == true)
                foreach (var include in param.Includes)
                    if (include.IsCollection)
                        _context.Entry(current).Collection(include.TableName).Load();
                    else
                        _context.Entry(current).Reference(include.TableName).Load();

            _context.Entry(current).State = EntityState.Detached;
            return current;
        }

        public virtual async Task<T> Add(T entity)
        {
            _context.Set<T>().Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public virtual async Task<T> Update(T entity)
        {
            _context.Set<T>().Attach(entity);
            _context.Entry(entity).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return entity;
        }

        public virtual async Task<bool> Delete(int id)
        {
            var current = await GetById(id);
            if (current != null)
            {
                _context.Set<T>().Remove(current);
                await _context.SaveChangesAsync();
                return true;
            }
            return false;
        }

        public void Dispose()
        {
            GC.SuppressFinalize(this);
        }
    }
}