using Presentation.Friends;

namespace Chat.API.Configurations;

public class PresentationServiceInstaller : IServiceInstaller
{
    public void Install(IServiceCollection services, IConfiguration configuration)
    {
        // Mapper
        services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

        // MediatR, Carter, FluentValidation
        services.AddCarter();
        services.AddMediatR(config => config.RegisterServicesFromAssembly(Presentation.AssemblyReference.Assembly));
        services.AddValidatorsFromAssembly(Presentation.AssemblyReference.Assembly, ServiceLifetime.Scoped);
        // services.AddScoped<IValidator<AcceptFriend.Request>, AcceptFriend.Validator>();
    }
}