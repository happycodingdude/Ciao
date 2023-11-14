using MyConnect.Model;

namespace MyConnect.Repository
{
    public class ParticipantsRepository : BaseRepository<Participants>, IParticipantsRepository
    {
        public ParticipantsRepository(CoreContext context) : base(context) { }
    }
}