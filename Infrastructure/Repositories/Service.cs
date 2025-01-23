namespace Infrastructure.Repositories;

public class Service<T> : IService<T> where T : class
{
    readonly IServiceScopeFactory _serviceScopeFactory;
    readonly IServiceProvider _serviceProvider;

    public Service(IServiceScopeFactory serviceScopeFactory, IServiceProvider serviceProvider)
    {
        _serviceScopeFactory = serviceScopeFactory;
        _serviceProvider = serviceProvider;
    }

    public T Get()
    {
        using var scope = _serviceProvider.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<T>();
        return service;
    }
}