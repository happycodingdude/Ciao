namespace Chat.API.Configurations;

public class PresentationServiceInstaller : IServiceInstaller
{
    public void Install(IServiceCollection services, IConfiguration configuration, IHostEnvironment environment)
    {
        services.AddCarter();
        services.AddMediatR(config => config.RegisterServicesFromAssembly(Presentation.AssemblyReference.Assembly));

        // Carter registers validators as Singleton via services.Add (not TryAdd).
        // Remove those Singleton registrations then re-add as Scoped so validators
        // can safely inject Scoped repositories.
        var presentationAssembly = Presentation.AssemblyReference.Assembly;
        var validatorInterface = typeof(IValidator<>);

        var singletonValidators = services
            .Where(d =>
                d.Lifetime == ServiceLifetime.Singleton &&
                d.ImplementationType != null &&
                d.ImplementationType.Assembly == presentationAssembly &&
                d.ImplementationType.GetInterfaces().Any(i =>
                    i.IsGenericType && i.GetGenericTypeDefinition() == validatorInterface))
            .ToList();

        foreach (var descriptor in singletonValidators)
            services.Remove(descriptor);

        services.AddValidatorsFromAssembly(presentationAssembly, ServiceLifetime.Scoped);
    }
}
