namespace SendProcessor.Configurations;

public interface IServiceInstaller
{
    void Install(IServiceCollection services, IConfiguration configuration, IHostEnvironment environment);
}