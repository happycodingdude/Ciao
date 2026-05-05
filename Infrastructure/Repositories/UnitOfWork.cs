namespace Infrastructure.Repositories;

public class UnitOfWork(MongoDbContext mongoDbContext, ILogger logger) : IUnitOfWork, IDisposable
{
    IClientSessionHandle? _session;
    Dictionary<Guid, Func<IClientSessionHandle, Task<long>>> _operations = new();
    Dictionary<Guid, Func<IClientSessionHandle, Task<long>>> _fallbacks = new();

    public void AddOperation<TResult>(Func<IClientSessionHandle, Task<TResult>> operation) where TResult : class
    {
        _operations.Add(Guid.NewGuid(), async (session) =>
        {
            var result = await operation(session);
            return ExtractModifiedCount(result);
        });
    }

    public void AddOperation<TResult>(Guid key, Func<IClientSessionHandle, Task<TResult>> operation) where TResult : class
    {
        _operations.Add(key, async (session) =>
        {
            var result = await operation(session);
            return ExtractModifiedCount(result);
        });
    }

    public void AddFallback<TResult>(Guid key, Func<IClientSessionHandle, Task<TResult>> fallback) where TResult : class
    {
        _fallbacks.Add(key, async (session) =>
        {
            var result = await fallback(session);
            return ExtractModifiedCount(result);
        });
    }

    public async Task SaveAsync()
    {
        if (!_operations.Any()) return;

        // Toàn bộ operations chạy trong cùng 1 Mongo transaction (yêu cầu replica set).
        // Pattern operation+fallback theo `key`: nếu primary op không match (ModifiedCount==0)
        // thì chạy fallback (vd. update-then-insert / update-then-push) — vẫn nằm trong transaction
        // nên đảm bảo atomic giữa op và fallback.
        using (_session = await mongoDbContext.Client.StartSessionAsync())
        {
            _session.StartTransaction();
            try
            {
                foreach (var operation in _operations)
                {
                    var modifiedCount = await operation.Value.Invoke(_session);
                    logger.Information("operation result => modifiedCount={ModifiedCount}", modifiedCount);

                    // Chỉ chạy fallback khi op tương ứng (cùng key) không tác động document nào.
                    if (modifiedCount == 0 && _fallbacks.TryGetValue(operation.Key, out var fallback))
                    {
                        var fallbackModified = await fallback.Invoke(_session);
                        logger.Information("fallback result => modifiedCount={ModifiedCount}", fallbackModified);
                    }
                }
                await _session.CommitTransactionAsync();
            }
            catch (Exception ex)
            {
                // Abort để rollback toàn bộ. CHÚ Ý: hiện exception đang bị "nuốt" (chỉ log),
                // caller không biết transaction đã fail → cần xử lý theo nghiệp vụ ở tầng trên
                // nếu muốn cảnh báo user. Đây là điểm cần cải thiện trong tương lai.
                logger.Error(ex, "UnitOfWork transaction failed, aborting");
                await _session.AbortTransactionAsync();
            }
        }

        ClearOperations();
    }

    static long ExtractModifiedCount<TResult>(TResult result)
    {
        return result switch
        {
            UpdateResult ur => ur.IsModifiedCountAvailable ? ur.ModifiedCount : 0,
            ReplaceOneResult ror => ror.IsModifiedCountAvailable ? ror.ModifiedCount : 0,
            DeleteResult dr => dr.DeletedCount,
            _ => 0
        };
    }

    void ClearOperations()
    {
        _operations.Clear();
        _fallbacks.Clear();
    }

    public void Dispose()
    {
        _session?.Dispose();
    }
}
