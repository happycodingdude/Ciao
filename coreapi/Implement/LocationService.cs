using MyDockerWebAPI.Interface;
using MyDockerWebAPI.Model;
using MyDockerWebAPI.Repository;

namespace MyDockerWebAPI.Implement
{
    public class LocationService : BaseRepository<Location>, ILocationService
    {
        public LocationService(CoreContext context, IConfiguration configuration) : base(context, configuration)
        {

        }
    }
}