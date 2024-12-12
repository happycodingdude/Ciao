namespace Infrastructure.Repositories;

public class Service<T> : IService<T> where T : class
{
    readonly IServiceScopeFactory _serviceScopeFactory;
    readonly T _service;

    public Service(IServiceScopeFactory serviceScopeFactory, T service)
    {
        _serviceScopeFactory = serviceScopeFactory;
        _service = service;
    }

    public T Get()
    {
        if (_service is not null) return _service;
        using var scope = _serviceScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetService<T>();
        return service;
    }
}