using MyDockerWebAPI.Interface;
using MyDockerWebAPI.Model;
using MyDockerWebAPI.Repository;

namespace MyDockerWebAPI.Implement
{
    public class ParticipantService : BaseRepository<Participant>, IParticipantService
    {
        public ParticipantService(CoreContext context, IConfiguration configuration) : base(context, configuration)
        {

        }
    }
}