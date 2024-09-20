namespace Infrastructure.Repositories;

public class Service(IServiceScopeFactory serviceScopeFactory, IUnitOfWork uow) : IService
{
    public T Get<T>() where T : IInitDatabase
    {
        using var scope = serviceScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetService<T>();
        service.UseUOW(uow);
        return service;
    }

    public T Get<T>(IUnitOfWork uow) where T : IInitDatabase
    {
        using var scope = serviceScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetService<T>();
        service.UseUOW(uow);
        return service;
    }
}