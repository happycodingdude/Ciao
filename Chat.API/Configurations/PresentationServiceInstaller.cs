namespace Chat.API.Configurations;

public class PresentationServiceInstaller : IServiceInstaller
{
    public void Install(IServiceCollection services, IConfiguration configuration, IHostEnvironment environment)
    {
        // MediatR, Carter, FluentValidation
        services.AddCarter();
        services.AddMediatR(config => config.RegisterServicesFromAssembly(Presentation.AssemblyReference.Assembly));
        services.AddValidatorsFromAssembly(Presentation.AssemblyReference.Assembly, ServiceLifetime.Scoped);
    }
}