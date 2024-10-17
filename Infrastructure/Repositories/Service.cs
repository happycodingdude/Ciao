namespace Infrastructure.Repositories;

// public class Service(IServiceScopeFactory serviceScopeFactory, IUnitOfWork uow) : IService
// {
//     public T Get<T>() where T : IInitDatabase
//     {
//         using var scope = serviceScopeFactory.CreateScope();
//         var service = scope.ServiceProvider.GetService<T>();
//         service.UseUOW(uow);
//         return service;
//     }

//     public T Get<T>(IUnitOfWork uow) where T : IInitDatabase
//     {
//         using var scope = serviceScopeFactory.CreateScope();
//         var service = scope.ServiceProvider.GetService<T>();
//         service.UseUOW(uow);
//         return service;
//     }
// }

public class Service<T> : IService<T> where T : IInitDatabase
{
    private readonly IServiceScopeFactory serviceScopeFactory;
    private readonly IUnitOfWork uow;
    private readonly T _service;

    public Service(IServiceScopeFactory serviceScopeFactory, IUnitOfWork uow, T service)
    {
        this.serviceScopeFactory = serviceScopeFactory;
        this.uow = uow;
        _service = service;
    }

    public T Get()
    {
        if (_service is not null) return _service;
        using var scope = serviceScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetService<T>();
        // service.UseUOW(uow);
        return service;
    }

    // public T Get(IUnitOfWork uow)
    // {
    //     using var scope = serviceScopeFactory.CreateScope();
    //     var service = scope.ServiceProvider.GetService<T>();
    //     service.UseUOW(uow);
    //     return service;
    // }
}